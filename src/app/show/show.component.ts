import { Component, ComponentRef, ViewChild, ViewContainerRef}   from '@angular/core';
import { AfterViewInit, OnInit, OnDestroy}          from '@angular/core';
import { OnChanges, SimpleChange, ComponentFactory} from '@angular/core';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { IHaveDynamicData, DynamicTypeBuilder } from '../dynamic/type.builder';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-show',
  template: `
<div>
  <button class="btn btn-primary-outline btn-sm" (click)="refreshContent()">Refresh</button>
  <button class="btn btn-primary-outline btn-sm" (click)="saveData()">Save Data</button>
  <div #dynamicContentPlaceHolder></div>  <hr />
  data: <pre>{{data | json}}</pre>
</div>
`,
  providers: [DynamicTypeBuilder, COMPILER_PROVIDERS]
})
export class ShowComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @ViewChild('dynamicContentPlaceHolder', { read: ViewContainerRef })
  protected dynamicComponentTarget: ViewContainerRef;
  protected componentRef: ComponentRef<IHaveDynamicData>;
  private sub: any;
  protected wasViewInitialized = false;
  ssHtml: any;
  ssVar: any;
  // example entity ... to be recieved from other app parts
  // this is kind of candiate for @Input
  public data = {};
  static namelist: string[] = [];
  static html: string;
  static formname: string = "f02";
  constructor(protected typeBuilder: DynamicTypeBuilder, public af: AngularFire, private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      ShowComponent.formname = params['id'];
      this.ssHtml = this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
        if (res && res.contenthtml) {
          let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
          ShowComponent.html = convertedHtml;
          //console.log(ShowComponent.html);
          setTimeout(() => {

            if (ShowComponent.html !== undefined && ShowComponent.html.length > 0) {
              this.ssVar = this.af.database.list("/forms/" + ShowComponent.formname + "/data").subscribe(items => {
                items.map(item => {
                  this.data[item.varname] = item.value;
                });
              }
              );
              console.log("Initial namelist=" + ShowComponent.namelist + " len=" + ShowComponent.namelist.length);

              this.ssVar.unsubscribe();
              this.refreshContent();
            }
          }, 1000);
        }
      }
      );


    });

  }

  saveData() {
    let formname: string = "f01";
    if (ShowComponent.namelist !== undefined) {
      console.log("html=" + ShowComponent.html);
      console.log("Save namelist=" + ShowComponent.namelist + " len=" + ShowComponent.namelist.length);
      for (var i = 0; i < ShowComponent.namelist.length; i++) {
        let n = ShowComponent.namelist[i];
        console.log("dataall:" + JSON.stringify(this.data) + "name:" + n + "datan=" + this.data[n] + "txtArea:" + this.data["txtArea"]);

        this.af.database.object("/forms/" + formname + "/data/" + n).update({
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

    return s;
  }
  // escapeRegex(value: string) {
  //   return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  // }
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
      console.log("Tag only reg:" + re);
      var p = src.replace(re, function (match, a, b, c, d, e) {
        console.log("Tag only name push :" + d);
        if (ShowComponent.namelist.indexOf(d) < 0) ShowComponent.namelist.push(d);
        console.log("tag only a:" + a + " b:" + b + " c:" + c + " d:" + d + e);
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
  // testFunc() {
  //   let s = 'maxlength="100" name="txtOfficeTel" required="required" size="20';
  //   let sre = new RegExp("(\\w*=?\"?'?\\w*\"?'?)(\\s*name=\")(\\w*)(\".+?)", "g");
  //   if (s !== "") {
  //     console.log("xxx .s=" + s + " sreReg=" + sre);
  //     let srep = s.replace(sre, function (match, a, b, c, d) {
  //       console.log("yyyy:" + a + b + c + d);
  //       //if (ShowComponent.namelist.indexOf(q1) < 0) ShowComponent.namelist.push(q1);
  //       return a + b.replace(' name="', ' [(ngModel)]="data[\'') + c + "']" + d;
  //     });

  //     console.log(srep);
  //   }
  // }
  ConvertInputTextBox(src: string): string {
    // var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="text".+?)/g, function (match, a, b, c) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);
    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });
    // var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="text")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

    //   return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    // });
    //  var p2 = this.ReplaceWithParam(src, "input", "text");
    var p2 = this.ReplaceWithParam(src, "input", "tel");
    p2 = this.ReplaceWithParam(p2, "input", "email");
    p2 = this.ReplaceWithParam(p2, "input", "text");
    p2 = this.ReplaceWithParam(p2, "input", "search");
    p2 = this.ReplaceWithParam(p2, "input", "password");
    p2 = this.ReplaceWithParam(p2, "input", "url");
    return p2;
  }
  ConvertTextarea(src: string): string {
    // var p = src.replace(/(<\s*textarea\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*.+?)/g, function (match, a, b, c) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });
    // var p2 = p.replace(/(<\s*textarea\s*\w*=?\"?\'?\w*\"?\'?\s*)(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

    //   return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    // });
    var p2 = this.ReplaceWithParam(src, "textarea", "");
    return p2;
  }
  ConvertCheckBox(src: string): string {
    // var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="checkbox".+?)/g, function (match, a, b, c) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });
    // var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="checkbox")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

    //   return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    // });

    var p2 = this.ReplaceWithParam(src, "input", "checkbox");
    return p2;
  }

  ConvertDropdown(src: string): string {
    // var p = src.replace(/(<\s*select\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*.+?)/g, function (match, a, b, c) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });
    // var p2 = p.replace(/(<\s*select\s*\w*=?\"?\'?\w*\"?\'?\s*)(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

    //   return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    // });
    var p2 = this.ReplaceWithParam(src, "select", "");
    return p2;
  }
  ConvertTable(src: string): string {
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
      if (ShowComponent.namelist.indexOf(name) < 0) ShowComponent.namelist.push(name);

      return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    });
    return p2;
  }
  ConvertRadio(src: string): string {
    // var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="radio".+?)/g, function (match, a, b, c) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });
    // var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="radio")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
    //   if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

    //   return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    // });

    var p2 = this.ReplaceWithParam(src, "input", "radio");
    return p2;
  }
  protected refreshContent() {

    if (this.componentRef) {
      this.componentRef.destroy();
    }

    if (ShowComponent.html == undefined) return;
    var template = ShowComponent.html;

    this.typeBuilder
      .createComponentFactory(template)
      .then((factory: ComponentFactory<IHaveDynamicData>) => {
        // Target will instantiate and inject component (we'll keep reference to it)
        this.componentRef = this
          .dynamicComponentTarget
          .createComponent(factory);

        // let's inject @Inputs to component instance
        let component = this.componentRef.instance;

        component.data = this.data;
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