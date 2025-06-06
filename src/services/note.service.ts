import { ApiResponse } from '../types/api/api.interface';
import { NoteItem } from '../types/note/response/note.response';
import api from './api.service';

const URLBASE = 'productivity/note';

export const NoteService = {
  saveNote: async (note: NoteItem): Promise<NoteItem> => {
    try {
      const response = await api.patch<ApiResponse<{ note: NoteItem }>>(
        `productivity/note/${note._id}`,
        {
          content: note.content,
          title: note.title,
          folder_id: note.folder_id,
        }
      );
      const savedNote = { ...response.data.data.note, type: 'file' as const };
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
  },

  handleDeleteNote: async (note: NoteItem): Promise<void> => {
    try {
      await api.delete(`productivity/${URLBASE}/${note._id}`);
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
  },

  handleCreateNote: async (
    folder_id: string | null,
    title: string
  ): Promise<NoteItem> => {
    try {
      const response = await api.post<ApiResponse<{ note: NoteItem }>>(
        `productivity/${URLBASE}`,
        {
          folder_id,
          title,
          content: '',
        }
      );
      return { ...response.data.data.note, type: 'file' as const };
    } catch (error: any) {
      console.error('Failed to create note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create note ${title}`);
    }
  },

  handleRenameNote: async (title: string, item: NoteItem): Promise<void> => {
    try {
      await api.patch(`productivity/note/${item._id}`, {
        title,
        content: item.content,
        folder_id: item.folder_id,
      });
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
  },

  formatNoteWithGemini: async (content: string): Promise<string> => {
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
– Preserve The Original Meaning And Wording — Don’t Paraphrase, Remove, Or Add New Content.
– Feel Free To Group Related Lines, Create Sections, Or Use Headings Where They Make Sense.
– If Something Looks Like A List Or A Schedule, Format It As Such.
– Don’t Overuse <p> — Mix And Match Tags Naturally For Better Structure.
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
  },
};
