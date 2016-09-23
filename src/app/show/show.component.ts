//import { Component } from '@angular/core';
import { Component, ComponentRef, ViewChild, ViewContainerRef}   from '@angular/core';
import { AfterViewInit, OnInit, OnDestroy}          from '@angular/core';
import { OnChanges, SimpleChange, ComponentFactory} from '@angular/core';
//import {RuntimeCompiler} from '@angular/compiler';
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
  // reference for a <div> with #dynamicContentPlaceHolder
  @ViewChild('dynamicContentPlaceHolder', { read: ViewContainerRef })
  protected dynamicComponentTarget: ViewContainerRef;
  //data: any ={};
  // this will be reference to dynamic content - to be able to destroy it
  protected componentRef: ComponentRef<IHaveDynamicData>;
  private sub: any;
  // until ngAfterViewInit, we cannot start (firstly) to process dynamic stuff
  protected wasViewInitialized = false;

  // example entity ... to be recieved from other app parts
  // this is kind of candiate for @Input
  public data = {};// { namea: "ABC123",nameb: "A description of this Entity" };
  static namelist: string[] = [];
  //static namedata: any[] = [];
  static html: string;
  static formname: string = "f02";
  // wee need Dynamic component builder
  constructor(protected typeBuilder: DynamicTypeBuilder, public af: AngularFire, private route: ActivatedRoute) {
    //let formname: string = "f01";

    // if (ShowComponent.formname == "f01") console.log("Correct!!");
    // this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
    //   if (res && res.contenthtml) {
    //     let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
    //     //console.log("html=" + convertedHtml);
    //     ShowComponent.html = convertedHtml;
    //   }
    // }
    // );

  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
     // console.log("pppp:" + params['id']);
      ShowComponent.formname = params['id']; // (+) converts string 'id' to a number
      this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
        if (res && res.contenthtml) {
          let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
          //console.log("html=" + convertedHtml);
          ShowComponent.html = convertedHtml;
        }
      }
      );
      // In a real app: dispatch action to load the details here.
      setTimeout(() => {

        if (ShowComponent.html !== undefined && ShowComponent.html.length > 0) {
          //console.log("html2:" + ShowComponent.html);
          this.af.database.list("/forms/" + ShowComponent.formname + "/data").subscribe(items => {
            //console.log("items:" + JSON.stringify(items));
            items.map(item => {
             // console.log("item:" + item.varname + item.value);
              this.data[item.varname] = item.value;
              //console.log("data:" + JSON.stringify(this.data));
              //item.metadata = this.af.database.object('/items_meta/' + item.$key);
            });
            //return items;
          }
          );
        }
      }, 1000);
    });

  }

  saveData() {
    //console.log("data=" + this.data['aa'] + JSON.stringify(this.data));
    let formname: string = "f01";
    if (ShowComponent.namelist !== undefined) {
      console.log("html=" +  ShowComponent.html);
      console.log("namelist=" + ShowComponent.namelist + ShowComponent.namelist.length);//this.data['aa'] + JSON.stringify(this.data));
      for (var i = 0; i < ShowComponent.namelist.length; i++) {
        let n = ShowComponent.namelist[i];
        console.log("dataall:" + JSON.stringify(this.data) + "name:" + n + "datan=" + this.data[n] + "txtArea:" +  this.data["txtArea"]);
        //if (this.data[n] !== undefined) {
          this.af.database.object("/forms/" + formname + "/data/" + n).update({
            varname: n,
            value: (this.data[n] === undefined)? " " : this.data[n],
            updateddate: (new Date()).toISOString().substr(0, 10)
          });
        //}
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
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    // var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
    //   return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    // });

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
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    // var p2 = src.replace(/(textarea.+)(name=")(.+?)(".+)/g, function (match, prefix, handler, name, suffix) {
    //   return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix;
    // });
    // var p2 = src.replace(/(<\s*textarea\s*\w*\s*name=")(\w*)("\w*\s*.+?)/g, function (match, a, b, c) {
    //   return a.replace(' name="', ' [(ngModel)]="data[\'') + b + "']" + c;
    // });

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
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    // var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="checkbox")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
    //   return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix2 + suffix3;
    // });
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
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
      if (ShowComponent.namelist.indexOf(name) < 0) ShowComponent.namelist.push(name);

      return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    });
    return p2;
  }
  ConvertTable(src: string): string {
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
      if (ShowComponent.namelist.indexOf(name) < 0) ShowComponent.namelist.push(name);

      return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix3;
    });
    return p2;
  }
  ConvertRadio(src: string): string {
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    // var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="radio")(.+)/g, function (match, prefix, handler, name, suffix, suffix2, suffix3) {
    //   return prefix + handler.replace(/name="/g, '[(ngModel)]="data[\'') + name + '\']' + suffix + suffix2 + suffix3;
    // });

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
    // here we get a TEMPLATE with dynamic content === TODO
    //var template = this.templateBuilder.prepareTemplate(this.entity, useTextarea);

    //var template = `<p><input maxlength="11" [(ngModel)]="data['aa']" size="11" /></p>`;// this.templateBuilder.prepareTemplate(this.entity, useTextarea);
    var template = ShowComponent.html;
    //console.log("template=" + template);
    // this.entity.push('namea','100');
    // this.entity.push('nameb','200');            
    // here we get Factory (just compiled or from cache)
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
        //...
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