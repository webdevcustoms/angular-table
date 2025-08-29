import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserElement } from '../../common/interface/user';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class EditDialogComponent {
  // Форма для редактирования данных пользователя
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    private fb: FormBuilder,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserElement }
  ) {
    // Инициализация формы с валидацией
    this.editForm = this.fb.group({
      name: [data.user.name, [Validators.required, Validators.minLength(2)]],
      surname: [
        data.user.surname,
        [
          Validators.required, // Обязательное поле
          Validators.minLength(2), // Минимальная длина 2 символа
        ],
      ],
      email: [
        data.user.email,
        [
          Validators.required,
          Validators.pattern(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/), // Валидация email формата
        ],
      ],
      phone: [
        data.user.phone,
        [
          Validators.pattern(
            /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/
          ), // Валидация российского номера телефона
        ],
      ],
    });
  }

  // Обработчик сохранения изменений
  onSave(): void {
    // Проверяем валидность формы перед сохранением
    if (this.editForm.valid) {
      // Создаем обновленного пользователя
      const updatedUser: UserElement = {
        ...this.data.user,
        ...this.editForm.value,
      };

      // Сохраняем изменения через сервис данных
      this.dataService.updateUser(updatedUser);

      // Закрываем диалог и передаем обновленные данные
      this.dialogRef.close(updatedUser);
    }
  }

  // Обработчик отмены редактирования
  onCancel(): void {
    // Просто закрываем диалог без передачи данных
    this.dialogRef.close();
  }
}
