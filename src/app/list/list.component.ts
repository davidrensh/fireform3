import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
@Component({
  selector: 'app-list',
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.css']
})
export class ListComponent implements OnInit {
  title: string;
  html: string;
  items: FirebaseListObservable<any[]>;
  subData: FirebaseListObservable<any[]>;
  myaf: AngularFire;
  constructor(af: AngularFire) {//
    //console.log("aaaa");
    this.items = af.database.list('/forms');
    this.myaf = af;
  }
  // setMessage(message: string) {
  //   this.title = 'Fireform 3';
  //   this.html = `<div>{{title}}</div><ul><li class="text" *ngFor="let item of items | async">{{item.$value}}</li></ul>
  //   <button (click)="self.saveForm('dynamic component')">Save</button>
  //   `;
  
  // }
  // saveForm(message: string) {
  //   //save end user submited form data 
  // }
    listData(formname: string) {
    //save end user submited form data 
      this.subData = this.myaf.database.list('/forms/'+ formname + "/data");
  }
  ngOnInit() {
  }

}
