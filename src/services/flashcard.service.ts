import { ApiResponse } from '../types/api/api.interface';
import {
  CreateFlashcardRequest,
  ReviewFlashcardRequest,
  UpdateFlashcardDeckRequest,
  UpdateFlashcardRequest,
} from '../types/flashcard/request/flashcard.request';
import { FlashcardDeckResponse } from '../types/flashcard/response/flashcard.response';
import api from './api.service';

class FlashcardService {
  private flashcardDeckPath: string = '/productivity/flashcard-deck';
  private flashcardPath: string = '/productivity/flashcard';
  private reviewPath: string = '/productivity/review-session';

  public async getFlashcardDeckList(): Promise<FlashcardDeckResponse[]> {
    try {
      const response = await api.get<ApiResponse<FlashcardDeckResponse[]>>(
        `${this.flashcardDeckPath}/all`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return [];
  }

  public async getFlashcardDeckListByWorkspace(workspaceId: string): Promise<FlashcardDeckResponse[]> {
    try {
      const response = await api.get<ApiResponse<FlashcardDeckResponse[]>>(
        `${this.flashcardDeckPath}/workspace/${workspaceId}`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return [];
  }

  public async getFlashcardStatistic(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.flashcardDeckPath}/statistics`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return [];
  }

  public async getFlashcardStatisticByWorkspace(workspaceId: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.flashcardDeckPath}/workspace/${workspaceId}/statistics`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return [];
  }

  public async createFlashcardDeck(title: string, workspaceId?: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.flashcardDeckPath}`,
        {
          title,
          workspace_id: workspaceId,
        }
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async updateFlashcardDeck(
    updatedFlashcardDeck: UpdateFlashcardDeckRequest
  ): Promise<any> {
    try {
      const response = await api.patch<ApiResponse<any>>(
        `${this.flashcardDeckPath}/${updatedFlashcardDeck._id}`,
        {
          title: updatedFlashcardDeck.title,
        }
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async deleteFlashcardDeck(id: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(
        `${this.flashcardDeckPath}/${id}`
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async getFlashcardList(id: string): Promise<FlashcardDeckResponse> {
    try {
      const response = await api.get<ApiResponse<FlashcardDeckResponse>>(
        `${this.flashcardDeckPath}/${id}`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
      throw Error('Lỗi khi fetch API');
    }
  }

  public async updateFlashcard(
    updatedFlashcard: UpdateFlashcardRequest
  ): Promise<any> {
    try {
      const response = await api.patch<ApiResponse<any>>(
        `${this.flashcardPath}/${updatedFlashcard._id}`,
        {
          ...updatedFlashcard,
        } as UpdateFlashcardRequest
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async createFlashcard(item: CreateFlashcardRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.flashcardPath}`,
        {
          deck_id: item.deck_id,
          front: item.front,
          back: item.back,
        } as CreateFlashcardRequest
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error: any) {
      console.error('Lỗi khi fetch API:', error);
      throw Error(error.message);
    }
  }

  public async deleteFlashcard(id: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(
        `${this.flashcardPath}/${id}`
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async reviewFlashcard(item: ReviewFlashcardRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.reviewPath}/review`,
        {
          ...item,
        } as ReviewFlashcardRequest
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }

  public async generateFlashcardsFromPdf(formData: FormData): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.flashcardDeckPath}/generate-from-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes timeout for PDF processing
        }
      );
      const data = response.data.data;
      console.log('PDF generation result:', data);
      return data;
    } catch (error: any) {
      console.error('Lỗi khi generate flashcards từ PDF:', error);
      throw error.response?.data?.message || error.message || 'Failed to generate flashcards from PDF';
    }
  }
}

export default new FlashcardService();

