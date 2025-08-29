import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from './components/table/table.component';
import { ButtonsComponent } from './components/buttons/buttons.component';
import { ApiService } from './services/api.service';
import { UserElement } from '../app/common/interface/user';
import { ApiResponse } from '../app/common/interface/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableComponent, ButtonsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Заголовок приложения
  mainTitle: string = 'Клиенты';
  // Массив для хранения данных пользователей
  userData: UserElement[] = [];

  // Приватные свойства для хранения URL API и ключа localStorage
  private apiUrl = 'https://test-data.directorix.cloud/task1';
  private localStorageKey = 'userData';

  // Внедрение зависимости ApiService через конструктор
  constructor(private apiService: ApiService) {}

  // Метод жизненного цикла - инициализация компонента
  async ngOnInit() {
    await this.loadUserData();
  }

  // Загружаем данные пользователей из localStorage или с сервера
  private async loadUserData(): Promise<void> {
    // Получаем сохраненные данные из localStorage
    const savedData = localStorage.getItem(this.localStorageKey);

    if (savedData) {
      // Если данные есть в localStorage - парсим их
      this.userData = JSON.parse(savedData);
      console.log('Данные загружены из localStorage:', this.userData);
    } else {
      // Если данных нет - загружаем с сервера
      await this.fetchDataFromServer();
    }
  }

  // Получаем данные пользователей с сервера
  private async fetchDataFromServer(): Promise<void> {
    try {
      // Выполняем GET-запрос к API
      const response = await this.apiService.get<ApiResponse>(this.apiUrl);
      // Сохраняем полученные данные
      this.userData = response.users;
      // Сохраняем данные в localStorage
      this.saveToLocalStorage();
      console.log('Данные получены с сервера:', this.userData);
    } catch (error) {
      // Обработка ошибок при запросе
      console.error('Проблема с получением данных с сервера:', error);
      this.userData = [];
    }
  }

  // Сохраняем текущие данные пользователей в localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.userData));
  }

  // Очищаем данные пользователей в localStorage
  public clearLocalStorage(): void {
    localStorage.removeItem(this.localStorageKey);
    console.log('Хранилище localStorage очищено');
  }

  // Обновляем данные: очищаем localStorage и загружаем свежие данные с сервера
  async refreshData(): Promise<void> {
    this.clearLocalStorage();
    await this.fetchDataFromServer();
  }
}
