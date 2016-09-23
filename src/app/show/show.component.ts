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
      let o = this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
        if (res && res.contenthtml) {
          let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
          ShowComponent.html = convertedHtml;
        }
      }
      );

      setTimeout(() => {

        if (ShowComponent.html !== undefined && ShowComponent.html.length > 0) {
          let l = this.af.database.list("/forms/" + ShowComponent.formname + "/data").subscribe(items => {
            items.map(item => {
              this.data[item.varname] = item.value;
            });
          }
          );

          l.unsubscribe();
          o.unsubscribe();
        }
      }, 1000);
    });

  }

  saveData() {
    let formname: string = "f01";
    if (ShowComponent.namelist !== undefined) {
      console.log("html=" + ShowComponent.html);
      console.log("namelist=" + ShowComponent.namelist + ShowComponent.namelist.length);
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
    //s = this.ConvertDropdown(s);
    //s = this.ConvertTable(s);

    return s;
  }
  ConvertInputTextBox(src: string): string {
    var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="text".+?)/g, function (match, a, b, c) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);
      return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    });
    var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="text")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

      return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    });
    return p2;
  }
  ConvertTextarea(src: string): string {
    var p = src.replace(/(<\s*textarea\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*.+?)/g, function (match, a, b, c) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

      return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    });
    var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*)(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

      return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    });
    return p2;
  }
  ConvertCheckBox(src: string): string {
    var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="checkbox".+?)/g, function (match, a, b, c) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

      return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    });
    var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="checkbox")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

      return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    });
    return p2;
  }


  ConvertDropdown(src: string): string {
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
      if (ShowComponent.namelist.indexOf(name) < 0) ShowComponent.namelist.push(name);

      return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    });
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
    var p = src.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*name=")(\w*)("\s*\w*=?\"?\'?\w*\"?\'?\s*type="radio".+?)/g, function (match, a, b, c) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(b);

      return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    });
    var p2 = p.replace(/(<\s*input\s*\w*=?\"?\'?\w*\"?\'?\s*type="radio")(\s*\w*=?\"?\'?\w*\"?\'?)(\w*\s+name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c, d, e) {
      if (ShowComponent.namelist.indexOf(b) < 0) ShowComponent.namelist.push(d);

      return a + b + c.replace(' name="', ' [(ngModel)]="data[\'') + d + "']" + e;
    });


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