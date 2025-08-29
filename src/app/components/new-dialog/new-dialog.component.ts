import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit,
  Inject,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DataService } from '../../services/data.service';
import { UserElement } from '../../common/interface/user';

@Component({
  selector: 'app-new-dialog',
  templateUrl: './new-dialog.component.html',
  styleUrl: './new-dialog.component.scss',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class NewDialogComponent implements OnInit {
  // Форма для ввода данных нового пользователя
  myForm: FormGroup;
  // Массив для хранения данных пользователей
  userData: UserElement[] = [];
  // Заголовок диалогового окна
  dialogTitle: string = 'Новый клиент';
  // Ключ для хранения данных в localStorage
  private localStorageKey = 'userData';

  constructor(
    public dialogRef: MatDialogRef<NewDialogComponent>,
    private fb: FormBuilder,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; user: UserElement }
  ) {
    // Установка кастомного заголовка, если он передан в данных
    if (data?.title) {
      this.dialogTitle = data.title;
    }

    // Инициализация формы с валидацией
    this.myForm = this.fb.group({
      name: [
        '',
        [
          Validators.required, // Обязательное поле
          Validators.minLength(2), // Минимальная длина 2 символа
        ],
      ],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/), // Валидация email формата
        ],
      ],
      phone: [
        '',
        [
          Validators.pattern(
            /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/
          ), // Валидация российского номера телефона
        ],
      ],
    });
  }

  // Метод жизненного цикла - инициализация компонента
  ngOnInit() {
    this.loadFromLocalStorage();
  }

  // Загрузка данных пользователей из localStorage
  private loadFromLocalStorage(): void {
    const savedData = localStorage.getItem(this.localStorageKey);

    if (savedData) {
      try {
        this.userData = JSON.parse(savedData);

        // Дополнительная проверка типа данных
        if (!Array.isArray(this.userData)) {
          throw new Error('Данные в localStorage не являются массивом');
        }

        console.log('Успешно загружено из localStorage:', this.userData);
      } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
        this.clearAndReset(); // Очистка при ошибке
      }
    } else {
      console.log('Локальные данные не найдены');
      this.userData = [];
    }
  }

  // Очистка localStorage и сброс данных
  private clearAndReset(): void {
    localStorage.removeItem(this.localStorageKey);
    this.userData = [];
  }

  // Обработчик отправки формы
  onSubmit() {
    if (this.myForm.valid) {
      // Создание объекта нового пользователя
      const newUser: UserElement = {
        name: this.myForm.value.name,
        surname: this.myForm.value.surname,
        email: this.myForm.value.email,
        phone: this.myForm.value.phone || '', // Пустая строка, если телефон не указан
      };

      // Добавление пользователя через сервис
      this.dataService.addUser(newUser);

      // Закрытие диалога с передачей нового пользователя
      this.dialogRef.close(newUser);

      // Сброс формы
      this.myForm.reset();
    } else {
      console.log('Форма невалидна!');
    }
  }

  // Обработчик закрытия диалога без сохранения
  onClose(): void {
    this.dialogRef.close();
  }

  // Обработчик подтверждения
  onConfirm(): void {
    if (this.myForm.valid) {
      // Создание объекта с обновленными данными пользователя
      const updatedUser: UserElement = {
        ...this.data.user, // Исходные данные
        ...this.myForm.value, // Новые значения из формы
      };
      this.dialogRef.close(updatedUser);
    }
  }
}
