import { Component, OnInit, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
//import { CKEditorComponent } from 'ng2-ckeditor'

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
  signow: boolean = false;
  sigName: string = "";
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
    console.log("XXXXXXXXXX Load");
  }
  ngOnInit() {

  }
  insertStuff() {
    var s = 'Telephone:&nbsp;<input maxlength="100" name="txtOfficeTel" required="required" size="20" type="tel" />';
    this.ckeditor.instance.insertHtml(s);

  }
  insertSignature(name: string) {
    let s = `<div signature="" name="` + name + `" class="padClass" />`;
    // console.log("TO BE INSERT:" + s);
    // // let v = this.ckeditor.instance.txtContent;
    // // v.insertHtml(s);
    //CKEditorComponent..instances
    this.ckeditor.instance.insertHtml(s);
    //this.ckeditor.instance.insertText(s);
    // // this.ckeditor.instance.updateElement();
    // let r = this.ckeditor.instance.getData();
    // console.log("Insert res=" + r);

    // var fragment = this.ckeditor.instance.getSelection().getRanges()[0].extractContents()
    // var container = this.ckeditor.instance.dom.element.createFromHtml(s, this.ckeditor.instance.document)
    // fragment.appendTo(container)
    // this.ckeditor.instance.insertElement(container)
  }
  setFormType(typeName: string) {
    this.typename = typeName;
  }
  setpersontype(persontypeName: string) {
    this.persontypename = persontypeName;
  }
  saveFormYes() {
    let s = this.ckeditor.instance.getData();
    if (s.indexOf('<style style="display: none" type="text/css">.padClass') < 0)
      s = s + `<style style="display: none" type="text/css">.padClass {
    position: relative;
    font-size: 10px;
    width: 300px;
    height: 80px;
    border: 1px solid #e8e8e8;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
    border-radius: 4px;
}
</style>`;
    this.af.database.object("/forms/" + this.formname).update({
      name: this.formname,
      typename: this.typename,
      persontypename: this.persontypename,
      needpassword: this.needpassword,
      needsignature: this.needsignature,
      password: this.password,
      contenthtml: s,
      updateddate: (new Date()).toISOString().substr(0, 10)
    });
  }
  saveForm() {
    let s: string = this.ckeditor.instance.getData();
    if (s.length > 0) {
      this.confirm = false;
      this.saveFormYes();
    }
    else this.confirm = true;
  }
}
