import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP! status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      throw error;
    }
  }
}
