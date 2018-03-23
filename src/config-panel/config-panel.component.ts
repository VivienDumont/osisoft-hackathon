import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { ConfigComponent, PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi'

@Component({
  selector: 'config-panel',
  templateUrl: 'config-panel.component.html',
  styleUrls: ['config-panel.component.css']
})
export class ConfigPanelComponent implements ConfigComponent, OnInit{
    paramIndex: number;
    selectedSymbols: any[];
    changeLayout: EventEmitter<any> = new EventEmitter;
    changeParam: EventEmitter<any> = new EventEmitter;

    elementcategory: any;
    elementsTOshow:any;
    EFcategory:any;
    EFtemplate:any;
    selectedELEF:any;
    AttributeofselectedELEF:any;

    isShow: boolean = true;
    
    serverName: string = '';
    values = [];

    constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) { }

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
          //this.AnalysesDatabase(db);
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

    ngOnInit(){
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
            this.BuildData(r.body);
          },
          e => {
            console.error(e);
          });
    }

    ngOnChanges(changes) {
        console.log(changes);
    }

    HideShow(){
        this.isShow = !this.isShow;
    }

    GoUp(){

    }

    GoDown(){

    }

    Add(){

    }

    Delete(){

    }
}