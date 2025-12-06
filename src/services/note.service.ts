import { ApiResponse } from '../types/api/api.interface';
import { NoteItem } from '../types/note/response/note.response';
import api from './api.service';
import SocketService from './socket.service';

const URLBASE = 'productivity/note';

class NoteServiceClass {
  async saveNote(note: NoteItem): Promise<NoteItem> {
    try {
      const response = await api.patch<ApiResponse<{ note: NoteItem }>>(
        `${URLBASE}/${note._id}`,
        {
          content: note.content,
          title: note.title,
          folder_id: note.folder_id,
        }
      );

      const savedNote = {
        ...response.data.data.note,
        type: 'file' as const,
        permission: response.data.data.note.permission || note.permission,
        isShared: response.data.data.note.isShared || note.isShared,
        sharedBy: response.data.data.note.sharedBy || note.sharedBy,
        owner_info: response.data.data.note.owner_info || note.owner_info,
      };

      console.log('Saved note with sharing info:', savedNote);
      return savedNote;
    } catch (error: any) {
      console.error(
        `Failed to save note ${note._id} (folder_id: ${note.folder_id}):`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error(`Could not save note ${note.title}`);
    }
  }

  async handleDeleteNote(note: NoteItem): Promise<void> {
    try {
      await api.delete(`${URLBASE}/${note._id}`);

      SocketService.emitNoteDeleted(note._id);
    } catch (error: any) {
      console.error(
        `Failed to delete note ${note._id} (folder_id: ${note.folder_id}):`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error(`Could not delete note ${note.title}`);
    }
  }

  async handleCreateNote(
    folder_id: string | null,
    title: string
  ): Promise<NoteItem> {
    try {
      const response = await api.post<ApiResponse<{ note: NoteItem }>>(
        `${URLBASE}`,
        {
          folder_id,
          title,
          content: '',
        }
      );

      SocketService.emitFolderStructureChanged();

      return { ...response.data.data.note, type: 'file' as const };
    } catch (error: any) {
      console.error('Failed to create note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create note ${title}`);
    }
  }

  async handleRenameNote(title: string, item: NoteItem): Promise<void> {
    try {
      await api.patch(`${URLBASE}/${item._id}`, {
        title,
        content: item.content,
        folder_id: item.folder_id,
      });

      SocketService.emitNoteRenamed(item._id, title);
    } catch (error: any) {
      console.error(
        `Failed to rename note ${item._id} (folder_id: ${item.folder_id}):`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error(`Could not rename note to ${title}`);
    }
  }

  async handleUpdateNote(item: NoteItem): Promise<void> {
    try {
      await api.patch(`${URLBASE}/${item._id}`, {
        title: item.title,
        content: item.content,
        folder_id: item.folder_id,
      });

      SocketService.emitFolderStructureChanged();
    } catch (error: any) {
      console.error(
        `Failed to update note ${item._id}:`,
        {
          error: error.message,
          response: error.response?.data,
        }
      );
      throw new Error(`Could not update note ${item.title}`);
    }
  }

  async formatNoteWithGemini(content: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing Gemini API key');

    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
      apiKey;

    const prompt = `
   Please Help Format The Following Note Content Into Clean, Readable HTML.

✨ Be Thoughtful And Flexible When Deciding How To Structure The Content. Use Your Best Judgment To Apply Meaningful Tags Like
<h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>, <pre>, <a>, And Others When Appropriate.

✅ Keep In Mind:
– Preserve The Original Meaning And Wording — Don't Paraphrase, Remove, Or Add New Content.
– Feel Free To Group Related Lines, Create Sections, Or Use Headings Where They Make Sense.
– If Something Looks Like A List Or A Schedule, Format It As Such.
– Don't Overuse <p> — Mix And Match Tags Naturally For Better Structure.
– Do Not Repeat Titles Or Headers That Already Exist In The Text.
– No Explanation Is Needed; Just Return The Clean HTML.

🛠️ Feel Free To Adjust Structure, Add Headings Or Sections — But Do Not Modify Or Duplicate The Original Content In Any Way.

Your Goal Is To Bring Out The Structure That Might Already Be Implied In The Note, While Keeping Everything Honest To The Original Content.




Content:
${content}
`;
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to call Gemini API');
    const data = await res.json();
    const formattedContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!formattedContent) throw new Error('No formatted content from Gemini');
    return formattedContent;
  }

  async fetchNoteById(noteId: string) {
    const res = await api.get(`/productivity/note/${noteId}`);
    return res.data.data;
  }

  /**
   * Create a note in a room (auto-creates folder if not exists)
   */
  async createNoteInRoom(title: string, liveRoomId: string): Promise<NoteItem> {
    try {
      const response = await api.post<ApiResponse<{ note: NoteItem }>>(
        `${URLBASE}/create-note-room`,
        {
          title,
          live_room_id: liveRoomId,
        }
      );

      SocketService.emitFolderStructureChanged();
      return { ...response.data.data.note, type: 'file' as const };
    } catch (error: any) {
      console.error('❌ Failed to create note in room:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create note ${title}`);
    }
  }

  /**
   * Get all notes for a room
   */
  async getNotesByRoomId(roomId: string): Promise<NoteItem[]> {
    try {
      const response = await api.get<ApiResponse<NoteItem[]>>(
        `${URLBASE}/room/${roomId}`
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch notes by room:', {
        error: error.message,
        response: error.response?.data,
      });
      return [];
    }
  }

  /**
   * Delete a note in a room
   */
  async deleteNoteInRoom(noteId: string): Promise<void> {
    try {
      await api.delete(`${URLBASE}/delete-note-room/${noteId}`);
      console.log('✅ Note deleted from room:', noteId);
      SocketService.emitNoteDeleted(noteId);
    } catch (error: any) {
      console.error('❌ Failed to delete note from room:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not delete note ${noteId}`);
    }
  }

  /**
   * Update a note in a room (via WebSocket or REST)
   */
  async updateNoteInRoom(
    noteId: string,
    title: string | undefined,
    content: string | undefined,
    liveRoomId: string
  ): Promise<void> {
    try {
      // Optionally use WebSocket if available, otherwise REST API
      console.log(`📤 Updating note ${noteId} in room ${liveRoomId}`);

      // Send via REST API
      await api.patch(`${URLBASE}/${noteId}`, {
        title,
        content,
      });

      console.log('✅ Note updated in room');
    } catch (error: any) {
      console.error('❌ Failed to update note in room:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not update note');
    }
  }

  /**
   * Rename a note in a room
   */
  async renameNoteInRoom(
    noteId: string,
    newTitle: string,
    liveRoomId: string
  ): Promise<void> {
    try {
      console.log(
        `📝 Renaming note ${noteId} to "${newTitle}" in room ${liveRoomId}`
      );

      // Send via REST API
      await api.patch(`${URLBASE}/${noteId}`, {
        title: newTitle,
      });

      console.log('✅ Note renamed in room');
    } catch (error: any) {
      console.error('❌ Failed to rename note in room:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not rename note');
    }
  }
}

// Tạo instance của class
const noteService = new NoteServiceClass();

// Export instance làm default
export default noteService;
