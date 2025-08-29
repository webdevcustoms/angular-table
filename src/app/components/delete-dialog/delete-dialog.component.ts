import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DeleteDialogComponent {
  // Заголовок диалогового окна
  dialogTitle: string = 'Удаление строк';

  // Количество элементов для удаления
  countToDelete: number;

  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { count: number }
  ) {
    // Инициализация количества удаляемых элементов из входных данных
    this.countToDelete = data.count;
  }

  // Обработчик закрытия диалога без подтверждения
  onClose(): void {
    // Закрываем диалог с результатом false (отмена)
    this.dialogRef.close(false);
  }

  // Обработчик подтверждения удаления
  onConfirm(): void {
    // Закрываем диалог с результатом true (подтверждение)
    this.dialogRef.close(true);
  }
}
