import { Component, OnInit, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { CKEditorModule } from 'ng2-ckeditor'

@Component({
  selector: 'app-tempeditor',
  templateUrl: 'Tempeditor.component.html',
  styleUrls: ['tempeditor.component.css']
})
export class TempeditorComponent implements OnInit {
  myckeditor: any;
  fireforms: FirebaseListObservable<any[]>;
  content: any;
  formname: string;
  //editor1: any;
  //html: string;
  constructor(private _zone: NgZone, public af: AngularFire) {
    // console.log("testtttt11111");
    // this.content = `<p>My HTML22</p>`;
    this.formname = "f01";
    this.fireforms = this.af.database.list("/forms");
    // this.fireforms.subscribe(r => {
    //   if (r) r.map(rr => {
    //     MemberHome.s_dealer = rr;
    //   });
    // });
    const queryObservable = af.database.list('/forms', {
      query: {
        limitToFirst: 1
      }
    }).subscribe(r => {
     // console.log("from q list:" + JSON.stringify(r));
      if (r) r.map(rr => {
         this.selectForm(rr);
      });
    });

  }

  selectForm(d: any) {
    //console.log("from selectForm:" + JSON.stringify( d));
    this.formname = d.name;
    console.log("from selectForm formname:" + d.name + this.formname);
    let subs = this.af.database.object("/forms/" + this.formname).subscribe(res => {
      if (res) {
        this.content = res.contenthtml;
        //console.log("Editor details 99");
        //subs.unsubscribe();
      }
    }
    );
    subs.unsubscribe();
  }
  ngOnInit() {
    //    CKEditor..replace( targetId );
  }
  insertStuff() {
    console.log("Editor details2:" + this.myckeditor);
    this.content = 'Telephone:&nbsp;<input maxlength="100" name="txtOfficeTel" required="required" size="20" type="tel" />' + this.content;
  }
  saveForm() {
    //let formname: string = "f01";
    //if (this !== undefined && this.content !== undefined) {
    console.log("html001=" + this.content);
    this.af.database.object("/forms/" + this.formname).update({
      name: this.formname,
      contenthtml: this.content,
      updateddate: (new Date()).toISOString().substr(0, 10)
    });
    // }
  }
}
