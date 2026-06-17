import api from '../api';
import { ApiResponse } from './types';

export interface FilterOptionDto {
  q?: string;
  levels?: string[]; // 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'AllLevels'
  isPaid?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CourseCreatorDto {
  id: string;
  name: string;
  avt_url: string;
}

export interface SearchCourseItemDto {
  id: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  course_level: string;
  rating: number;
  short_description: string | null;
  created_at: string;
  user?: CourseCreatorDto;
}

export interface SearchMetaDto {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FacetsDto {
  levels: Record<string, number>;
  priceTypes: {
    FREE: number;
    PAID: number;
  };
}

export interface SearchCourseResponseDto {
  data: SearchCourseItemDto[];
  meta: SearchMetaDto;
  facets: FacetsDto;
}

export const courseApi = {
  searchCourses: async (filters: FilterOptionDto): Promise<SearchCourseResponseDto> => {
    const queryParams: any = { ...filters };
    if (filters.levels && filters.levels.length > 0) {
      queryParams.levels = filters.levels.join(',');
    } else {
      delete queryParams.levels;
    }

    const response = await api.get<ApiResponse<SearchCourseResponseDto>>('courses/course/search', {
      params: queryParams,
    });
    return response.data.data;
  },
};
