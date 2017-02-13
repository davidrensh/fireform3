import { Component, ComponentRef, ViewChild, ContentChildren, ViewContainerRef } from '@angular/core';
import { AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { OnChanges, SimpleChange, ComponentFactory } from '@angular/core';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { IHaveDynamicData, DynamicTypeBuilder } from '../dynamic/type.builder';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
//import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../role.service';
import { BrowserModule } from '@angular/platform-browser'


@Component({
  selector: 'app-show',
  template: `
<div>

    <div  #dynamicContentPlaceHolder></div>

  
</div>
`,
  styleUrls: ['show.component.css'],
  //      <signature-pad [options]="signaturePadOptions" (onBeginEvent)="drawStart()" (onEndEvent)="drawComplete()"></signature-pad>

  providers: [DynamicTypeBuilder, COMPILER_PROVIDERS]
})

export class ShowComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @ViewChild('dynamicContentPlaceHolder', { read: ViewContainerRef })
  //@ViewChild('SignaturePad', { read: ViewContainerRef })
  //@ContentChildren('SignaturePad')
  // signaturePad: SignaturePad;
  //private form2: FormGroup;

  protected dynamicComponentTarget: ViewContainerRef;
  protected componentRef: ComponentRef<IHaveDynamicData>;
  private sub: any;
  protected wasViewInitialized = false;
  ssHtml: any;
  ssVar: any;
  // example entity ... to be recieved from other app parts
  // this is kind of candiate for @Input
  public signed: boolean = false;
  public data = {};
  public attrdata = {};
  public rowedit = {};
  public roweditvalue = {};
  static namelist: string[] = [];
  public repeatorVarList: string[] = [];
  public dstable = {};
  public datanewrow = {};
  public repeatorData = [];

  //signed: boolean;
  static html: string;
  static formname: string = "f02";


  constructor(public rs: RoleService, protected typeBuilder: DynamicTypeBuilder, public af: AngularFire, private route: ActivatedRoute) {
    this.rs.role = 1;
    // this.form = fb.group({
    //   signatureField: '',
    // });
  }

  ngOnInit() {
    //this.signaturePad.clear();
    this.signed = false;
    //this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    //this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    // this.enteredPassword = "";
    this.sub = this.route.params.subscribe(params => {
      ShowComponent.formname = params['id'];
      this.ssHtml = this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
        if (res && res.contenthtml) {
          this.attrdata["typename"]       = res.typename;
          this.attrdata["persontypename"] = res.persontypename;
          this.attrdata["password"]       = res.password;
          this.attrdata["needpassword"]   = res.needpassword;
          this.attrdata["needsignature"]  = res.needsignature;          
          let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);

          
          //console.log("res.persontypename:" + res.persontypename);
          ShowComponent.html = convertedHtml;


          // setTimeout(() => {

          if (ShowComponent.html !== undefined && ShowComponent.html.length > 0) {

            this.ssVar = this.af.database.list("/forms/" + ShowComponent.formname + "/data").subscribe(items => {
              items.map(item => {
                this.data[item.varname] = item.value;
              });
            }
            );

            this.loadExdata(ShowComponent.html);
            // console.log("exdata EEE:" + JSON.stringify(this.data));
            //console.log("Initial namelist=" + ShowComponent.namelist + " len=" + ShowComponent.namelist.length);
            //console.log("data G:" + JSON.stringify(this.data));

            setTimeout(() => {
              this.ssVar.unsubscribe();
              this.refreshContent();
            }, 1000);
          }
          // }, 1000);
        }
      }
      );


    });

  }

  loadExdata(s: string) {
    let match = -1;
    let matchEnd = -1;
    let toMatch = "data['";
    let toMatchEnd = ".";
    let i = 0;
    while ((match = s.indexOf(toMatch, i)) > -1) {
      matchEnd = s.indexOf(toMatchEnd, match + 1);
      if (matchEnd > -1) {
        let exname = s.substr(match + toMatch.length, matchEnd - (match + toMatch.length));
        if (exname.indexOf("'") < 0 && exname.indexOf("\"") < 0) {
          // console.log("exname 11:" + exname + "::");
          //console.log("exname :" + exname + " hh:" + match + toMatch.length + matchEnd);
          //this.exdata[exname]
          //setTimeout(() => {
          //console.log("exname 22:" + exname + "::");

          let sVar = this.af.database.list("/forms/" + exname + "/data").subscribe(items => {
            //this.exdata[exname] = "cheating008";
            //console.log("exdata A:" + this.exdata[exname] );// + JSON.stringify(this.exdata));
            //this.exdata[exname] = items;

            items.map(item => {
              //console.log("exdata C:" + item.varname + item.value);
              this.data[exname + toMatchEnd + item.varname] = item.value;
              //console.log("exname + toMatchEnd + item.varname:" + exname + toMatchEnd + item.varname + "   Value:" + item.value);
              //console.log(exname + toMatchEnd + item.varname + "exdata D:" + this.data[exname + toMatchEnd + item.varname] + JSON.stringify(this.data));
              //this.exdata[exname][item.varname] = item.value;
              //console.log("exdata D:" + item.varname + item.value + this.exdata[exname][item.varname]);
              // console.log("exdata 001:" + item + JSON.stringify(item));// + JSON.stringify(this.exdata));
              // ;//"cheating";
              // console.log("exdata 009:" + this.exdata[exname] + this.exdata['f03']+ this.exdata[exname]);
            });
          }
          );
          //sVar.unsubscribe();
          //}, 1000);
        }
      }
      i = match + toMatch.length;
    }
    //console.log("exdata :" + JSON.stringify(this.data));
  }

  saveData() {
    //let formname: string = "f01";
    if (ShowComponent.namelist !== undefined) {
      console.log("html=" + ShowComponent.html);
      console.log("Save namelist=" + ShowComponent.namelist + " len=" + ShowComponent.namelist.length);
      for (var i = 0; i < ShowComponent.namelist.length; i++) {
        let n = ShowComponent.namelist[i];
        console.log("dataall:" + JSON.stringify(this.data) + "name:" + n + "datan=" + this.data[n] + "txtArea:" + this.data["txtArea"]);

        this.af.database.object("/forms/" + ShowComponent.formname + "/data/" + n).update({
          varname: n,
          value: (this.data[n] === undefined) ? " " : this.data[n],
          updateddate: (new Date()).toISOString().substr(0, 10)
        });

      }
    }
  }
  ConvertToNg2Template(src: string): string {
    let s = this.ConvertInputTextBox(src);
    s = this.ConvertTextarea(s);
    s = this.ConvertCheckBox(s);
    s = this.ConvertRadio(s);
    s = this.ConvertDropdown(s);
    //s = this.ConvertTable(s);

    s = this.ConvertRepeator(s);
    console.log(s);

    return s;
  }

  ReplaceWithParam(src: string, tag: string, typename: string): string {
    // this.testFunc();
    let sr: string = "";
    if (typename !== "")
      sr = "(<\\s*" + tag + "\\s*)([^>]*)(\\s*type=)('|\")(" + typename + ")('|\")([^>]*)(>)";
    else
      sr = "(<\\s*" + tag + "\\s*)([^>]*)(\\s*name=\")(\\w*)(\".*)";
    var re = new RegExp(sr, "g");
    // console.log(" reg:" + re);
    if (typename === "") {
      // console.log("Tag only reg:" + re);
      var p = src.replace(re, function (match, a, b, c, d, e) {
        //console.log("Tag only name push :" + d);
        if (ShowComponent.namelist.indexOf(d) < 0) ShowComponent.namelist.push(d);
        //console.log("tag only a:" + a + " b:" + b + " c:" + c + " d:" + d + e);
        return a + b + c.replace('name="', '[(ngModel)]="data[\'') + d + "']" + e;
      });
      return p;
    }
    //console.log("chek sreReg=" + re);
    var p = src.replace(re, function (match, a, b, c, d, e, f, g, h) {
      let s = "";
      //console.log("tag only a:" + a + " b:" + b + " c:" + c + " d:" + d + " e:" + e + " f:" + f + " g:" + g + " H:" + h);
      if (b.indexOf("name=") > -1) s = b;
      if (g.indexOf("name=") > -1) s = g;

      let sre = new RegExp("(\\w*=?\"?\\w*\"?)(\\s*name=\")(\\w*)(\".*?)", "g");
      if (s !== "") {
        //console.log("name .s=" + s + " sreReg=" + sre);
        let srep = s.replace(sre, function (match2, p0, p1, q1, r1) {
          //console.log("Attribute name push :" + q1);
          if (ShowComponent.namelist.indexOf(q1) < 0) ShowComponent.namelist.push(q1);
          return p0 + p1.replace('name="', '[(ngModel)]="data[\'') + q1 + "']" + r1;
        });
        if (b.indexOf("name=") > -1) {
          // console.log("Final res for b case:" + a + srep + c + d + e + f + g + h);
          return a + srep + c + d + e + f + g + h;
        }
        if (g.indexOf("name=") > -1) {
          //console.log("Final res for g case:" + a + b + c + d + e + f + srep + h);
          return a + b + c + d + e + f + srep + h;
        }

      }
      return a + b + c + d + e + f + g + h;
    });

    return p;
  }

  ConvertInputTextBox(src: string): string {
    var p2 = this.ReplaceWithParam(src, "input", "tel");
    p2 = this.ReplaceWithParam(p2, "input", "email");
    p2 = this.ReplaceWithParam(p2, "input", "text");
    p2 = this.ReplaceWithParam(p2, "input", "search");
    p2 = this.ReplaceWithParam(p2, "input", "password");
    p2 = this.ReplaceWithParam(p2, "input", "url");
    return p2;
  }
  ConvertTextarea(src: string): string {
    var p2 = this.ReplaceWithParam(src, "textarea", "");
    return p2;
  }
  ConvertCheckBox(src: string): string {
    var p2 = this.ReplaceWithParam(src, "input", "checkbox");
    return p2;
  }

  ConvertDropdown(src: string): string {

    var p2 = this.ReplaceWithParam(src, "select", "");
    return p2;
  }

  ConvertRepeator(src: string): string {
    let strReplaceAll = src;
    let sField = ' field="';
    let sRepeator = ' repeator="';
    let sCrud = ' crud="';
    let sDatasource = ' datasource="';
    let sUsername = ' username="';
    let spassword = ' password="';
    var crud = "";
    var datasource = "";
    var repeator = "";
    var username = "";
    var password = "";
    var field = "";
    let iRepeator = strReplaceAll.indexOf(sRepeator);
    if (iRepeator === undefined) return src;
    //console.log("iRepeator" + iRepeator);
    // Loop over the string value replacing out each matching
    // substring.
    while (iRepeator !== undefined && iRepeator != -1) {
      // Relace out the current instance.
      let sectionStart = strReplaceAll.lastIndexOf("<", iRepeator);

      //console.log("sectionStart" + sectionStart + strReplaceAll.substring(sectionStart, sectionStart + 20));
      //if (sectionStart === undefined || sectionStart < 0) return src;
      let mainTagEnd = strReplaceAll.indexOf(" ", sectionStart)
      //console.log("mainTagEnd" + mainTagEnd + strReplaceAll.substring(mainTagEnd, mainTagEnd + 20));
      if (mainTagEnd < 0) return src;

      let mainTag = strReplaceAll.substring(sectionStart + 1, mainTagEnd);
      let sectionEnd = strReplaceAll.indexOf("</" + mainTag + ">", sectionStart)
      //console.log("mainTag" + mainTag + sectionEnd + strReplaceAll.substring(sectionEnd, sectionEnd + 20));
      // console.log("mainTag:" + mainTag);
      if (sectionEnd < 0) return src;

      let sMainTagSection = strReplaceAll.substring(sectionStart, sectionEnd + ("</" + mainTag + ">").length);
      console.log("sMainTagSection:" + sMainTagSection);

      crud = this.GetAttributeValue(strReplaceAll, sectionStart, sCrud);
      datasource = this.GetAttributeValue(strReplaceAll, sectionStart, sDatasource);
      username = this.GetAttributeValue(strReplaceAll, sectionStart, sUsername);
      password = this.GetAttributeValue(strReplaceAll, sectionStart, spassword);
      repeator = this.GetAttributeValue(strReplaceAll, sectionStart, sRepeator);
      //console.log("crud" + crud + datasource + username + password + repeator);
      strReplaceAll = strReplaceAll.replace(sCrud + crud + '"', "");
      strReplaceAll = strReplaceAll.replace(sDatasource + datasource + '"', "");
      strReplaceAll = strReplaceAll.replace(sUsername + username + '"', "");
      strReplaceAll = strReplaceAll.replace(spassword + password + '"', "");

      let ds = "";
      if (datasource !== null && datasource !== "" && repeator !== "") {
        ds = "data['" + datasource + "." + repeator + "']";
        // this.data["'" + datasource + "." + repeator + "'"] = this.af.database.list("/forms/" + datasource + "/data/block/" + repeator);
        this.dstable["'" + datasource + "." + repeator + "'"] = datasource + "." + repeator;// this.af.database.list("/forms/" + datasource + "/data/block/" + repeator);
        // const o1 = this.data["'" + datasource + "." + repeator + "'"];
        // o1.subscribe(items => {
        //       items.map(item => {
        //         console.log("List value:" + item + item.f1 + item.f2);
        //       });
        //     }
        //     );
        //this.repeatorData[datasource + '.' + repeator] = null;

        // ds = "repeatorData['" + datasource + "']";
        // this.repeatorData[datasource] = this.af.database.list("/forms/" + datasource + "/data/block/" + repeator);
        // this.repeatorData[datasource] = null;
      } else if (repeator !== "") {
        ds = "data['" + repeator + "']";
        this.dstable["'" + datasource + "." + repeator + "'"] = this.af.database.list("/forms/" + ShowComponent.formname + "/data/block/" + repeator);
        // this.data["'" + repeator + "'"] = this.af.database.list("/forms/" + ShowComponent.formname + "/data/block/" + repeator);
        //console.log("repeatorDataB:" + JSON.stringify(this.repeatorData[repeator]));
        //this.repeatorData[repeator] = null;
      }

      strReplaceAll = strReplaceAll.replace(sRepeator + repeator + '"', ' *ngFor="let dataobj of getlist(\'' + datasource + '\',\'' + repeator + '\') | async"');
      let sAddNewHeader = this.GetAddNewSection(sMainTagSection, mainTag, repeator);

      let fieldStart = strReplaceAll.indexOf(sField, 0);
      let fieldList = "";

      //let isLast = true;
      while (fieldStart != -1) {
        let detailStart = strReplaceAll.lastIndexOf("<", fieldStart);
        let detailTagEnd = strReplaceAll.indexOf(" ", detailStart);
        let detailTag = strReplaceAll.substring(detailStart + 1, detailTagEnd);
        let sectionEnd = strReplaceAll.indexOf("</" + detailTag + ">", detailStart);

        field = this.GetAttributeValue(strReplaceAll, detailStart, sField);
        fieldList = fieldList + "," + field;
        if (fieldStart === strReplaceAll.lastIndexOf(sField, strReplaceAll.length)) {
          if (fieldList.length > 0 && fieldList.substring(0, 1) === ',') fieldList = fieldList.substring(1);
          strReplaceAll = strReplaceAll.replace(sField + field + '">', '><label *ngIf="!rowediting[dataobj.$key]">{{dataobj.' + field + '}}</label><input *ngIf="rowediting[dataobj.$key]" [(ngModel)]="rowdata[dataobj.$key + \'' + field + '\']"><button *ngIf="!rowediting[dataobj.$key]" class="btn btn-primary-outline btn-sm" (click)="SetEdit(\'' + datasource + '\',\'' + repeator + '\',\'' + fieldList + '\',dataobj)">Edit</button><button *ngIf="!rowediting[dataobj.$key]" class="btn btn-primary-outline btn-sm" (click)="DeleteRow(\'' + datasource + '\',\'' + repeator + '\',dataobj.$key)">Delete</button><button *ngIf="rowediting[dataobj.$key]" class="btn btn-primary-outline btn-sm" (click)="Update(\'' + datasource + '\',\'' + repeator + '\',\'' + fieldList + '\',dataobj.$key)">Update</button><button *ngIf="rowediting[dataobj.$key]" class="btn btn-primary-outline btn-sm" (click)="CancelEdit(dataobj.$key)">Cancel</button>');

        }
        else
          strReplaceAll = strReplaceAll.replace(sField + field + '">', '><label *ngIf="!rowediting[dataobj.$key]">{{dataobj.' + field + '}}</label><input *ngIf="rowediting[dataobj.$key]" [(ngModel)]="rowdata[dataobj.$key +\'' + field + '\']">');
        fieldStart = strReplaceAll.indexOf(sField, 0);
      }



      let addNewSection = this.AddNewAddInputSaveSection(sAddNewHeader, mainTag, repeator, sField, fieldList, datasource);

      if (strReplaceAll.indexOf(sRepeator) !== iRepeator)
        iRepeator = strReplaceAll.indexOf(sRepeator);
      else iRepeator = -1;
      sectionEnd = strReplaceAll.indexOf("</" + mainTag + ">", sectionStart);
      //      strReplaceAll = strReplaceAll.substring(0, sectionStart ) + '<template *ngIf=\'isDsLoaded\' >' + strReplaceAll.substring(sectionStart , sectionEnd + ("</" + mainTag + ">").length ) + '</template>' + strReplaceAll.substring(sectionEnd + ("</" + mainTag + ">").length);
      strReplaceAll = strReplaceAll.substring(0, sectionStart) + addNewSection + strReplaceAll.substring(sectionStart);
    }
    strReplaceAll = strReplaceAll.replace(sRepeator + repeator + '"', "");
    strReplaceAll = strReplaceAll.replace(' id="' + repeator + '"', "");
    return strReplaceAll;
  }
  GetAddNewSection(s: string, mainTag: string, repeator: string): string {
    let s1 = s.substring(0, mainTag.length + 1);
    let mainTagEnd = s.indexOf(">", 0);
    let s2 = s.substring(mainTagEnd + 1);
    s = s1 + ">" + s2;
    // let firstInnerEnd = s.indexOf(">", mainTagEnd + 1);
    // s = s.substring(0, firstInnerEnd) + '<button class="btn btn-primary-outline btn-sm" (click)="AddNew(\'' + repeator + '\',i, true)">Add</button>' +  s.substring(firstInnerEnd + 1);
    return s;
  }
  AddNewAddInputSaveSection(s: string, mainTag: string, repeator: string, sField: string, fieldList: string, datasource: string): string {
    //let isFirst = true;
    var field = "";
    let fieldStart = s.indexOf(sField, 0);
    //console.log("s===" + s);
    //console.log("sField" + sField);
    //console.log("fieldStart" + fieldStart);
    let newrowvarList = "";
    while (fieldStart != -1) {
      let detailStart = s.lastIndexOf("<", fieldStart);
      //console.log("START:" + detailStart );
      let detailTagEnd = s.indexOf(" ", detailStart);
      let detailTag = s.substring(detailStart + 1, detailTagEnd);
      let sectionEnd = s.indexOf("</" + detailTag + ">", detailStart);
      // console.log(" s =" + s + "detailStart" + detailStart + sField);
      field = this.GetAttributeValue(s, detailStart - 1, sField);
      //console.log(" field =xx:" + field);
      newrowvarList = newrowvarList + ',data[\'' + datasource + '.' + repeator + "." + field + '\']';

      //console.log("END:" + detailTag +  detailTagEnd  + " filed" + field);
      if (fieldStart === s.lastIndexOf(sField, s.length)) {
        //console.log("this.data:" + this.data[datasource + '.' + repeator + '.' + field])
        s = s.replace(sField + field + '">', '><input [(ngModel)]="data[\'' + datasource + '.' + repeator + "." + field + '\']">&nbsp;<button class="btn btn-primary-outline btn-sm" (click)="UpdateNew(\'' + datasource + '\',\'' + repeator + '\',\'' + fieldList + '\'' + newrowvarList + ')">Save</button>');
        // s = s.replace(sField + field + '">', '><input [(ngModel)]="datanewrow[\'' + datasource + '.' + repeator + "."  + field + '\']">&nbsp;<button class="btn btn-primary-outline btn-sm" (click)="UpdateNew(\'' + datasource + '\',\'' + repeator + '\',\'' + fieldList + '\',datanewrow)">Save</button>');        
        //isFirst = false;
        return s;
      }
      else {
        s = s.replace(sField + field + '">', '><input [(ngModel)]="data[\'' + datasource + '.' + repeator + "." + field + '\']">');
      }
      fieldStart = s.indexOf(sField, 0);
      // console.log("s222" + s);
      //console.log("fieldStart222" + fieldStart);
    }
    return s;
  }

  GetAttributeValue(strReplaceAll: string, sectionStart: number, find: string): string {
    let start = strReplaceAll.indexOf(find, sectionStart) + find.length;

    //console.log("strReplaceAll:" + strReplaceAll);
    //console.log("startXXXX:" + start);
    if (start > 0) {
      let end = strReplaceAll.indexOf('"', start);
      //console.log("endXXXX:" + end + " ooooo:" + strReplaceAll.substring(start, end));
      return strReplaceAll.substring(start, end);
    }
    return "";
  }
  ConvertTable(src: string): string {
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
      if (ShowComponent.namelist.indexOf(name) < 0) ShowComponent.namelist.push(name);

      return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    });
    return p2;
  }
  ConvertRadio(src: string): string {
    var p2 = this.ReplaceWithParam(src, "input", "radio");
    return p2;
  }
  wrapTemplate(t: string):string {
    let s = `  <input *ngIf="staticneedpassword()" class="form-control" [(ngModel)]="enteredPassword" placeholder="Form password">
  <input *ngIf="statictypename() === 'PerPerson' && staticpersontypename() === 'Email' " class="form-control" [(ngModel)]="enteredEmail" placeholder="Email">
  <input *ngIf="statictypename() === 'PerPerson' && staticpersontypename() === 'Phone' " class="form-control" [(ngModel)]="enteredPhone" placeholder="Phone">
  <div *ngIf="validPassword()">
    <button class="btn btn-primary-outline btn-sm" (click)="refreshContent()">Refresh</button>
    <button *ngIf="!staticneedsignature()" class="btn btn-primary-outline btn-sm" (click)="saveData()">Save Data</button>
    <div *ngIf="staticneedsignature()">
     
      <button *ngIf="signed" class="btn btn-primary-outline btn-sm" (click)="saveData()">Save Data</button>
    </div>
    <button class="btn btn-primary-outline btn-sm" (click)="print()">Print (as PDF)</button>
<div  id="print-section"><div class="printborder">` + t + `
  </div>
      </div></div>`;
    return s;
  }
  protected refreshContent() {

    if (this.componentRef) {
      this.componentRef.destroy();
    }

    if (ShowComponent.html == undefined) return;
    var template =this.wrapTemplate(ShowComponent.html);

    this.typeBuilder
      .createComponentFactory(template, this.dstable, this.attrdata)
      .then((factory: ComponentFactory<IHaveDynamicData>) => {
        // Target will instantiate and inject component (we'll keep reference to it)
        this.componentRef = this
          .dynamicComponentTarget
          .createComponent(factory);

        // let's inject @Inputs to component instance
        let component = this.componentRef.instance;

        component.data = this.data;
        component.signed = this.signed;
        // console.log("Listobj:" + this.dstable);
        //component.listobj = this.dstable;
        //component.InitialList(this.dstable);
      });
  }

  /** IN CASE WE WANT TO RE/Gerante - we need cean up */

  // this is the best moment where to start to process dynamic stuff
  public ngAfterViewInit(): void {
    this.wasViewInitialized = true;
    setTimeout(() => {
      this.refreshContent();
    }, 1000);
  }
  // wasViewInitialized is an IMPORTANT switch 
  // when this component would have its own changing @Input()
  // - then we have to wait till view is intialized - first OnChange is too soon
  public ngOnChanges(changes: { [key: string]: SimpleChange }): void {
    if (this.wasViewInitialized) {
      return;
    }
    this.refreshContent();
  }
  public ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }


}