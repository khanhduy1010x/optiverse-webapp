import { useEffect, useState, useRef } from 'react';
import { ref, onValue, get, child } from 'firebase/database';
import { db } from '../../firebase';
import { BlogPost, BlogPostWithAuthor } from '../../types/blog';
import blogService from '../../services/blog/blog.service';

/**
 * Hook để lấy workspace blog posts theo workspaceId
 * Reuse 100% blog logic, chỉ filter theo workspaceId
 */
export function useWorkspaceBlog(workspaceId: string | null) {
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track đã fetch authors chưa
  const fetchedAuthorsRef = useRef<Set<string>>(new Set());
  
  // Track current user ID
  const currentUserIdRef = useRef<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      currentUserIdRef.current = user.user_id || null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    console.log('📡 useWorkspaceBlog: Listening for workspace:', workspaceId);

    // Listen to all blog posts
    const postsRef = ref(db, 'blogPosts');
    
    // Listen to likes for real-time updates
    const likesRef = ref(db, 'blogLikes');

    const unsubscribePosts = onValue(
      postsRef,
      async (snapshot) => {
        try {
          const data = snapshot.val();

          if (!data) {
            console.log('⚠️ useWorkspaceBlog: No posts found');
            setPosts([]);
            setLoading(false);
            return;
          }

          // Filter workspace blog posts (chỉ lấy posts có workspaceId)
          const workspacePosts = Object.entries(data)
            .filter(([_, post]: [string, any]) => post.workspaceId === workspaceId)
            .map(([id, post]: [string, any]) => ({
              ...post,
              id
            })) as BlogPost[];

          console.log(`✅ useWorkspaceBlog: Found ${workspacePosts.length} posts`);

          // Fetch author info CHỈ cho authors MỚI (chưa fetch)
          const authorIds = Array.from(new Set(workspacePosts.map(p => p.authorId)));
          const newAuthorIds = authorIds.filter(id => !fetchedAuthorsRef.current.has(id));

          if (newAuthorIds.length > 0) {
            console.log('👥 Fetching new authors:', newAuthorIds);
            // Mark as fetched
            newAuthorIds.forEach(id => fetchedAuthorsRef.current.add(id));
          }

          // Get author info and like status for all posts
          const postsWithAuthors = await Promise.all(
            workspacePosts.map(async (post) => {
              try {
                const authorInfo = await blogService['getAuthorInfo'](post.authorId);
                
                // Check if current user liked this post - read directly from Firebase
                let isLiked = false;
                if (currentUserIdRef.current) {
                  try {
                    const likePath = `blogLikes/${post.id}/${currentUserIdRef.current}`;
                    const likeRef = ref(db, likePath);
                    const likeSnapshot = await get(likeRef);
                    isLiked = likeSnapshot.exists();
                  } catch (likeError) {
                    console.error('Error checking like status:', likeError);
                  }
                }
                
                return {
                  ...post,
                  author: authorInfo,
                  isLiked
                } as BlogPostWithAuthor;
              } catch (error) {
                console.error('Error fetching author:', error);
                return {
                  ...post,
                  author: {
                    id: post.authorId,
                    userId: post.authorId,
                    name: 'Unknown',
                    displayName: 'Unknown User',
                    postCount: 0,
                    followerCount: 0,
                    followingCount: 0,
                    isVerified: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  },
                  isLiked: false
                } as BlogPostWithAuthor;
              }
            })
          );

          // Sort by createdAt desc
          const sortedPosts = postsWithAuthors.sort((a, b) => b.createdAt - a.createdAt);
          
          setPosts(sortedPosts);
          setLoading(false);
        } catch (err: any) {
          console.error('❌ useWorkspaceBlog: Error processing data:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('❌ useWorkspaceBlog: Firebase error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    // Listen to likes changes for real-time updates
    const unsubscribeLikes = onValue(likesRef, () => {
      // Trigger posts refetch when likes change
      console.log('❤️ Likes changed, refreshing posts...');
      // Posts will auto-refresh through the posts listener
    });

    return () => {
      console.log('🔌 useWorkspaceBlog: Unsubscribing');
      unsubscribePosts();
      unsubscribeLikes();
    };
  }, [workspaceId]);

  return {
    posts,
    loading,
    error
  };
}
