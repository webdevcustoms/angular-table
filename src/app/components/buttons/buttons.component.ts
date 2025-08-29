import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { NewDialogComponent } from '../new-dialog/new-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../services/data.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'app-buttons',
  imports: [ButtonComponent, MatButtonModule, MatDialogModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss',
  standalone: true,
})
export class ButtonsComponent {
  constructor(
    private dialog: MatDialog,
    private dataService: DataService,
    private selectionService: SelectionService
  ) {}

  // Открываем диалоговое окно для создания нового пользователя
  openDialog() {
    this.dialog.open(NewDialogComponent, {
      data: { title: 'Новый клиент' },
    });
  }

  // Открывает диалоговое окно подтверждения удаления и обрабатывает результат
  deleteDialog() {
    // Проверяем, есть ли выделенные элементы
    if (this.selectionService.selection.selected.length > 0) {
      // Открываем диалог подтверждения удаления
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {
          count: this.selectionService.selection.selected.length, // Передаем количество выделенных элементов
        },
      });

      // Подписываемся на событие закрытия диалога
      dialogRef.afterClosed().subscribe((confirmed) => {
        // Если пользователь подтвердил удаление
        if (confirmed) {
          // Получаем emails выделенных пользователей
          const emailsToDelete = this.selectionService.selection.selected.map(
            (user) => user.email
          );

          // Удаляем пользователей через сервис данных
          this.dataService.deleteUsers(emailsToDelete);

          // Очищаем выделение
          this.selectionService.selection.clear();
        }
      });
    }
  }
}
