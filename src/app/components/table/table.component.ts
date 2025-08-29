import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { DataService } from '../../services/data.service';
import { UserElement } from '../../common/interface/user';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { CommonModule } from '@angular/common';
import { SelectionService } from '../../services/selection.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-table',
  styleUrl: './table.component.scss',
  templateUrl: './table.component.html',
  imports: [MatTableModule, MatCheckboxModule, CommonModule, MatSortModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
  // Определение отображаемых колонок таблицы
  displayedColumns: string[] = ['select', 'name', 'surname', 'email', 'phone'];
  // Источник данных для таблицы
  dataSource = new MatTableDataSource<UserElement>([]);

  // Получение ссылки на MatSort для управления сортировкой
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dataService: DataService,
    private dialog: MatDialog,
    public selectionService: SelectionService
  ) {}

  // Метод жизненного цикла - инициализация компонента
  ngOnInit(): void {
    this.loadData();
  }

  // Загружаем данные из DataService и инициализирует сортировку
  private loadData(): void {
    this.dataService.userData$.subscribe({
      next: (users) => {
        this.initializeSort();
        const sortedData = this.applyInitialSort(users || []);
        this.dataSource.data = sortedData;

        // Применяем сортировку после инициализации
        setTimeout(() => {
          if (this.sort) {
            this.applySortToData();
          }
        });
      },
      error: (err) => {
        console.error('Ошибка загрузки данных:', err);
        this.dataSource.data = [];
      },
    });
  }

  // Инициализирует механизм сортировки таблицы
  private initializeSort(): void {
    setTimeout(() => {
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'name':
              return item.name;
            case 'surname':
              return item.surname;
            case 'email':
              return item.email;
            case 'phone':
              return item.phone;
            default:
              return '';
          }
        };

        // Устанавливаем начальные параметры сортировки
        this.sort.active = 'name';
        this.sort.direction = 'asc';
        this.sort.start = 'asc';
      }
    });
  }

  // Применяем начальную сортировку (по имени по возрастанию)
  private applyInitialSort(data: UserElement[]): UserElement[] {
    return [...data].sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }

  // Применяет кастомную сортировку к данным таблицы
  private applySortToData(): void {
    if (!this.sort?.active) return;

    const isAsc = this.sort.direction === 'asc';
    const data = [...this.dataSource.data];

    data.sort((a, b) => {
      switch (this.sort.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'surname':
          return this.compare(a.surname, b.surname, isAsc);
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'phone':
          return this.compare(a.phone, b.phone, isAsc);
        default:
          return 0;
      }
    });

    this.dataSource.data = data;
  }

  // Метод для сравнения значений при сортировке
  private compare(
    a: string | number,
    b: string | number,
    isAsc: boolean
  ): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Обработчик сортировки при клике на заголовок таблицы
  sortData(sort: { active: string; direction: 'asc' | 'desc' | '' }) {
    if (!this.sort) return;

    // Обновляем параметры сортировки
    this.sort.active = sort.active;
    this.sort.direction = sort.direction;

    // Применяем сортировку через стандартный механизм MatTableDataSource
    this.dataSource.sort = this.sort;
  }

  // Обработчик клика по строке таблицы - открывает диалог редактирования
  onRowClick(user: UserElement): void {
    // Открываем диалоговое окно редактирования
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: { user }, // Передаем данные пользователя в диалог
    });

    // Обработчик закрытия диалога
    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (updatedUser) {
        console.log('Обновлены данные пользователя:', updatedUser);
      }
    });
  }

  // Проверяем, все ли строки таблицы выделены
  isAllSelected() {
    return (
      this.selectionService.selection.selected.length ===
      this.dataSource.data.length
    );
  }

  // Переключаем состояние выделения всех строк таблицы
  toggleAllRows() {
    if (this.isAllSelected()) {
      // Если все выделены - снимаем выделение
      this.selectionService.selection.clear();
      return;
    }
    // Иначе выделяем все строки
    this.selectionService.selection.select(...this.dataSource.data);
  }
}
