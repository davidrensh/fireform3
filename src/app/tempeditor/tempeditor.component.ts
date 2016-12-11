import { Component, OnInit, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
//import { CKEditorModule } from 'ng2-ckeditor'

@Component({
  selector: 'app-tempeditor',
  templateUrl: 'Tempeditor.component.html',
  styleUrls: ['tempeditor.component.css']
})
export class TempeditorComponent implements OnInit {
  @ViewChild('ckeditor') ckeditor: any;
  fireforms: FirebaseListObservable<any[]>;
  content: any;
  formname: string;
  constructor(private _zone: NgZone, public af: AngularFire) {
    this.fireforms = this.af.database.list("/forms");
    const queryObservable = af.database.list('/forms', {
      query: {
        limitToFirst: 1
      }
    }).subscribe(r => {
      if (r) r.map(rr => {
        setTimeout(() => {
          this.selectForm(rr);
        }, 1000);

      });
    });

  }

  selectForm(d: any) {
    this.formname = d.name;
    this.ckeditor.instance.setData(d.contenthtml);
   }
  ngOnInit() {

  }
  insertStuff() {
    var s = 'Telephone:&nbsp;<input maxlength="100" name="txtOfficeTel" required="required" size="20" type="tel" />';
    this.ckeditor.instance.insertHtml(s)
  }
  saveForm() {
    this.af.database.object("/forms/" + this.formname).update({
      name: this.formname,
      contenthtml: this.ckeditor.instance.getData(),
      updateddate: (new Date()).toISOString().substr(0, 10)
    });
  }
}
