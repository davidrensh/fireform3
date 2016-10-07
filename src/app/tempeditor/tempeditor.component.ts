import { Component, OnInit, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-tempeditor',
  templateUrl: 'Tempeditor.component.html',
  styleUrls: ['tempeditor.component.css']
})
export class TempeditorComponent implements OnInit {
  content: any;
  //html: string;
  constructor(private _zone: NgZone, public af: AngularFire) {
    // console.log("testtttt11111");
    // this.content = `<p>My HTML22</p>`;
    let formname: string = "f01";
    let subs = this.af.database.object("/forms/" + formname).subscribe(res => {
      if (res) {
        this.content = res.contenthtml;
        //subs.unsubscribe();
      }
    }
    );

  }

  ngOnInit() {
    //    CKEditor..replace( targetId );
  }
  saveForm() {
    let formname: string = "f01";
    //if (this !== undefined && this.content !== undefined) {
    console.log("html=" + this.content);
    this.af.database.object("/forms/" + formname).update({
      name: formname,
      contenthtml: this.content,
      updateddate: (new Date()).toISOString().substr(0, 10)
    });
    // }
  }
}
