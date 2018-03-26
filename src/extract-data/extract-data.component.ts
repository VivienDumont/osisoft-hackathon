/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, Inject, OnDestroy, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN, CONTEXT_MENU_TOKEN, ContextMenuAPI } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi';


@Component({
  selector: 'extract-data',
  templateUrl: 'extract-data.component.html',
  styleUrls: ['extract-data.component.css']
})
export class ExtractDataComponent implements OnChanges, OnDestroy {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  @Input() serverName: string;

  @Input() elementEfAttr: any;

  values: any[];
  startTime:string;
  endTime:string;

  id_setinter:any;


  constructor( @Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document:any, @Inject(CONTEXT_MENU_TOKEN) private contextMenu: ContextMenuAPI) {
    
    this.id_setinter = setInterval(() => {
      const all_input_datetime = this.document.querySelectorAll('pv-datetime input[type="text"]');
      this.startTime = all_input_datetime[all_input_datetime.length-2].value;
      this.endTime = all_input_datetime[all_input_datetime.length-1].value;
      console.log(this.startTime);
      console.log(this.endTime);
      
      this.GetEventFrame(
        {
          WebId: 'F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE'
        }
      );
      },
      30000
    );
  }

  ngOnDestroy() {
    if (this.id_setinter) {
      clearInterval(this.id_setinter);
    }
    console.log('destroy');
  }
 
  BuildData(body) {
    body[1].Content.Items.forEach(db => {
      const to_add = db;
      const index = body[1].Content.Items.indexOf(db);
      to_add.elements = body[2].Content.Items[index].Content.Items;
      this.values.push(to_add);
    });

    this.values.forEach(db => {
      db.elements.forEach(element => {
        this.GetElement(element);
      });
      this.AnalysesDatabase(db);
    });
    console.log(this.values);
  }

  private GetElement(element){

    this.piWebApiService.element.getElements$(element.WebId)
    .subscribe(
      r=>{
        element.elements = r.Items;
        element.elements.forEach(e => {
          if(e.HasChildren){
            this.GetElement(e);
          }
        });
      },
      e=>{
        console.error(e);
      }
    );
  }

  //get attribute template
  AnalysesElement(element){
    this.piWebApiService.element.getAnalyses$(element.WebId)
    .subscribe(
      r=>{
        element.analysesTemplateEventType = [];
        element.attributeTemplate = [];
        r.Items.forEach(template => {
          if (template.AnalysisRulePlugInName === 'EventFrame'){
            element.analysesTemplateEventType.push(template);
          } else {
            element.attributeTemplate.push(template);
          }
          
        });
      },
      e=>{
        console.error(e);
      }
    );
  }

  //get event frame template
  AnalysesDatabase(db){
    this.piWebApiService.assetDatabase.getAnalysisTemplates$(db.WebId,null)
    .subscribe(
      r=>{
        db.analysesTemplateEventType = [];
        r.Items.forEach(template => {
          if (template.AnalysisRulePlugInName === 'EventFrame'){
            db.analysesTemplateEventType.push(template);
          }
        });
      },
      e=>{
        console.error(e);
      }
    );

  }

  private GetEventFrame(element){

    const body ={
      "0": {
        "Method": "GET",
        "Resource": `https://pisrv01.pischool.int/piwebapi/elements/${element.WebId}/eventframes?starttime=${this.startTime}&endtime=${this.endTime}`
      }
    };

    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        const n_bd = r.body;
        this.values = r.body[0].Content.Items;
      },
      e => {
        console.error(e);
      }
    )
  }

  ngOnChanges(changes) {
    console.log(changes);
    if(changes.serverName){
      this.serverName = changes.serverName.currentValue;

      this.values = [];
      const body = { 
        "0": {
          "Method": "GET",
          "Resource": "https://pisrv01.pischool.int/piwebapi/assetservers?name=" + this.serverName
        },
        "1": {
          "Method": "GET",
          "Resource": "https://pisrv01.pischool.int/piwebapi/assetservers/{0}/assetdatabases?selectedFields=Items.WebId;Items.Id;Items.Path;Items.Name;Items.Description;Items.Links.Elements",
          "Parameters": [
            "$.0.Content.WebId"
          ],
          "ParentIds": [
            "0"
          ]
        },
        "2": {
          "Method": "GET",
          "RequestTemplate": {
            "Resource": "$.1.Content.Items[*].Links.Elements"
          },
          "ParentIds": [
            "1"
          ]
        }
      };

      this.piWebApiService.batch.execute$(body)
      .subscribe(r => {
        //this.BuildData(r.body);
      },
      e => {
        console.error(e);
      });
    }
    
  }

}
