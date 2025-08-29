import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserElement } from '../common/interface/user';
import { ApiService } from './api.service';
import { SelectionService } from '../services/selection.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Ключ для хранения данных в localStorage
  private readonly localStorageKey = 'userData';

  // URL API для получения данных
  private readonly apiUrl = 'https://test-data.directorix.cloud/task1';

  // BehaviorSubject для хранения текущего состояния данных
  private userDataSubject = new BehaviorSubject<UserElement[]>([]);

  // Публичное Observable для подписки на изменения данных
  public userData$ = this.userDataSubject.asObservable();

  constructor(
    private apiService: ApiService,
    public selectionService: SelectionService
  ) {
    // Инициализация данных при создании сервиса
    this.initializeData();
  }

  // Инициализирует данные: сначала проверяет localStorage, если данных нет - загружает с сервера
  private async initializeData(): Promise<void> {
    // Загрузка данных из localStorage
    const localData = this.loadFromLocalStorage();

    // Если есть локальные данные - используем их
    if (localData && localData.length > 0) {
      this.userDataSubject.next(localData);
      return;
    }

    try {
      // Загрузка данных с сервера
      const apiData = await this.apiService.get<{ users: UserElement[] }>(
        this.apiUrl
      );

      // Проверка и обнуление данных
      const serverData = Array.isArray(apiData?.users) ? apiData.users : [];

      // Если получили данные с сервера - сохраняем их
      if (serverData.length > 0) {
        this.saveToLocalStorage(serverData);
        this.userDataSubject.next(serverData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных с сервера:', error);

      // Если нет ни локальных, ни серверных данных - передаем пустой массив
      if (localData.length === 0) {
        this.userDataSubject.next([]);
      }
    }
  }

  // Загружаем данные из localStorage
  private loadFromLocalStorage(): UserElement[] {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Ошибка чтения из localStorage:', error);
      return [];
    }
  }

  // Сохраняем данные в localStorage
  private saveToLocalStorage(data: UserElement[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  }

  // Добавляем нового пользователя
  public addUser(user: UserElement): void {
    const currentData = this.userDataSubject.value;
    const newData = [...currentData, user];
    this.userDataSubject.next(newData);
    this.saveToLocalStorage(newData);
  }

  // Обновляем данные пользователя
  public updateUser(updatedUser: UserElement): void {
    const currentData = this.userDataSubject.value;

    // Ищем пользователя по email и передаем идентификатор
    const index = currentData.findIndex((u) => u.email === updatedUser.email);

    if (index !== -1) {
      // Создание нового массива с обновленными данными
      const newData = [...currentData];
      newData[index] = updatedUser;
      this.userDataSubject.next(newData);
      this.saveToLocalStorage(newData);
    }
  }

  // Удаляем пользователей по списку email
  public deleteUsers(emails: string[]): void {
    const currentData = this.userDataSubject.value;

    // Фильтрация массива - оставляем только тех, кого не нужно удалять
    const newData = currentData.filter((user) => !emails.includes(user.email));
    this.userDataSubject.next(newData);
    this.saveToLocalStorage(newData);

    // Если данных в массиве не осталось - очищаем выделение
    if (newData.length === 0) {
      this.selectionService.clearSelection();
    }
  }

  // Возвращаем текущие данные
  public getCurrentData(): UserElement[] {
    return this.userDataSubject.value;
  }
}
