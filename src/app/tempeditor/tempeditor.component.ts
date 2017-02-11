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
  typename: string;
  persontypename: string;
  needpassword: boolean;
  needsignature: boolean;
  password: string;
  confirm: boolean;
  constructor(private _zone: NgZone, public af: AngularFire) {
    this.confirm = false;
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
    this.typename = d.typename;

    this.persontypename = d.persontypename;
    this.password = d.password;
    this.needsignature = d.needsignature;
    this.needpassword = d.needpassword;
    this.ckeditor.instance.setData(d.contenthtml);
  }
  ngOnInit() {

  }
  insertStuff() {
    var s = 'Telephone:&nbsp;<input maxlength="100" name="txtOfficeTel" required="required" size="20" type="tel" />';
    this.ckeditor.instance.insertHtml(s)
  }
  setFormType(typeName: string) {
    this.typename = typeName;
  }
  setpersontype(persontypeName: string) {
    this.persontypename = persontypeName;
  }
  saveFormYes() {
    this.af.database.object("/forms/" + this.formname).update({
      name: this.formname,
      typename: this.typename,
      persontypename: this.persontypename,
      needpassword: this.needpassword,
      needsignature: this.needsignature,
      password: this.password,
      contenthtml: this.ckeditor.instance.getData(),
      updateddate: (new Date()).toISOString().substr(0, 10)
    });
  }
  saveForm() {
    let s:string = this.ckeditor.instance.getData();
    if (s.length > 0) {
      this.confirm = false;
      this.saveFormYes();
    }
    else this.confirm = true;
  }
}
