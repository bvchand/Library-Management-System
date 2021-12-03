import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from './book.service';
import { ChangeDetectorRef } from '@angular/core'
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
  message: 'bookIssued' | 'bookReturned' | 'Error';
}


export interface books {
  author_first_name: string;
  author_last_name: string;
  availability: boolean;
  price: number;
  title: string
}

export interface userHistory {
  author_first_name: string;
  author_last_name: string;
  availability: boolean;
  price: number;
  title: string
}

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {


  constructor(private bookService: BookService, private router: Router, private ref: ChangeDetectorRef,
    public dialog: MatDialog) { }

  allBooks: books[];
  public dataSource: MatTableDataSource<JSON>;

  takeBook: FormGroup;
  returnBook: FormGroup;
  getUserHist: FormGroup;
  private dataArray: any;
  ngOnInit(): void {
    this.bookService.getAllBooks()
      .subscribe((res) => {
        this.dataArray = res;
        this.dataSource = new MatTableDataSource<JSON>(this.dataArray);
        console.log(" dataArrya:", this.dataArray);
        this.allBooks = res;
        console.log("AllBooks:",this.allBooks);
      });


    this.takeBook = new FormGroup({
      email: new FormControl(),
      title: new FormControl()
    });

    this.returnBook = new FormGroup({
      email: new FormControl(),
      title: new FormControl()
    });

    this.getUserHist = new FormGroup({
      email: new FormControl()
    });

  }

  // refresh() {
  //   this.bookService.getAllBooks().subscribe((data: JSON[]) => {
  //     this.dataSource.data = data;
  //   });
  // }

  getBook(): void {
    let email = this.takeBook.get('email')!.value;
    let title = this.takeBook.get('title')!.value;

    this.bookService.getBook(email, title)
      .subscribe(
        (_: any) => {
          console.log("Saved");
          this.dialog.open(bookIssued, {data: {
            message: 'bookIssued',
          }});
        },
        (err: any) => {console.log("Error", err);
        this.dialog.open(DialogDataExampleDialog, {data: {
          message: 'Error',
        }});
      }
      );
  }

  returnBookMethod(): void {
    let email = this.returnBook.get('email')!.value;
    let title = this.returnBook.get('title')!.value;

    this.bookService.returnBook(email, title)
      .subscribe(
        (_: any) => {
          console.log("Saved");
          this.dialog.open(bookReturn, {data: {
            message: 'bookReturned',
          }});
      },
        (err: any) => {
          console.log("Error", err);
          this.dialog.open(DialogDataExampleDialog, {data: {
            message: 'Error',
          }});
        }
      );
  }

  getHistory(): void {
    let email = this.getUserHist.get('email')!.value;
    this.bookService.getUserHistory(email)
      .subscribe(
        (_: any) => {
          console.log("Saved");
          this.dialog.open(bookReturn, {data: {
            message: 'bookReturned',
          }});
      },
        (err: any) => {
          console.log("Error", err);
          this.dialog.open(DialogDataExampleDialog, {data: {
            message: 'Error',
          }});
        }
      );
  }

  displayedColumns: string[] = ['author_first_name', 'price', 'availability', 'title'];

}





@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data-example-dialog.html',
})
export class DialogDataExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'bookIssued.html',
})
export class bookIssued {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'bookReturn.html',
})
export class bookReturn {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}