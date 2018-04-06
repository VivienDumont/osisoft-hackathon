import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { ConfigComponent, PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi'

@Component({
  selector: 'config-panel',
  templateUrl: 'config-panel.component.html',
  styleUrls: ['config-panel.component.css']
})
export class ConfigPanelComponent implements ConfigComponent, OnInit{
    @Input() paramIndex: number;
    @Input() selectedSymbols: any[];
    @Output() changeLayout: EventEmitter<any> = new EventEmitter();
    @Output() changeParam: EventEmitter<any> = new EventEmitter();
    @Output() changeSymbol: EventEmitter<any> = new EventEmitter<any>();

    lstColor = [];

    elementcategory: any;
    elementsTOshow = [];
    EFcategory:any;
    EFtemplate:any;
    selectedELEF:any = [];
    AttributeofselectedELEF:any;
    selectedelefRow: any;

    isShow: boolean = true;
    
    serverName: string = '';
    values = [];
    listOfAttributeCategory:any = [];

    constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) {
        this.lstColor.push('#b20000');
        this.lstColor.push('#002171');
        this.lstColor.push('#ffffff');
        this.lstColor.push('#401212');
        this.lstColor.push('#000000');
        this.lstColor.push('#21142b');
        this.lstColor.push('#1b685b');
        this.lstColor.push('#965264');
        this.lstColor.push('#136572');
        this.lstColor.push('#bdcedd');
        this.lstColor.push('#f89f86');
    }

    getColorByBgColor(bgColor) {
        if (!bgColor) { return ''; }
        return (parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2) ? '#000' : '#fff';
    }

    BuildData(body) {
        this.values = [];
        body[1].Content.Items.forEach(db => {
          const to_add = db;
          const index = body[1].Content.Items.indexOf(db);
          to_add.elements = body[2].Content.Items[index].Content.Items;
          this.values.push(to_add);
        });
    
        this.values.forEach(db => {
          db.elements.forEach(element => {
            this.AnalysesElement(element)
            this.elementsTOshow.push(element);
            this.GetElement(element);
          });
        });
      }

      private GetElement(element){

        this.piWebApiService.element.getElements$(element.WebId)
        .subscribe(
          r =>{
            element.elements = r.Items;
            element.elements.forEach(e => {
                if(e.HasChildren){
                    this.AnalysesElement(e)
                    this.elementsTOshow.push(e);
                    this.GetElement(e);
                } else {
                    this.AnalysesElement(e)
                    this.elementsTOshow.push(e);
                }
            });
          },
          e=>{
            console.error(e);
          }
        );
      }

      AnalysesElement(element){
        this.piWebApiService.element.getAnalyses$(element.WebId)
        .subscribe(
          r=>{
            element.analysesTemplateEventType = [];
            element.attributeTemplate = [];
            r.Items.forEach(template => {
              if (template.AnalysisRulePlugInName === 'EventFrame'){
                element.analysesTemplateEventType.push(template);
              } 
              
            });
          },
          e=>{
            console.error(e);
          }
        );
      }

      GetAttributeFromEFTempate(element, template){
        this.piWebApiService.element.getEventFrames$(element.WebId)
        .subscribe(
            r => {
                const ef = r.Items.find(x => x.TemplateName === template.TemplateName || x.TemplateName.indexOf(template.TemplateName)+1 || template.TemplateName.indexOf(x.TemplateName)+1);
                if(ef){
                    this.piWebApiService.eventFrame.getAttributes$(ef.WebId)
                    .subscribe(
                        r_a => {
                            template.attributesTemplate = r_a.Items;
                            const lst_cat_attr = [];
                            r_a.Items.forEach(attr => {
                                attr.CategoryNames.forEach(cat_attr => {
                                    const found = lst_cat_attr.find(x => x.name.indexOf(cat_attr)+1);
                                    if(!found){
                                        lst_cat_attr.push({name: cat_attr, select: false});
                                    }
                                });
                            });
                            template.attributesTemplateCategories = lst_cat_attr;
                        },
                        e => {
                            console.error(e);
                        }
                    );
                }
            },
            e => {
                console.error(e);
            }
        );
      }

    Get(){
        this.elementsTOshow = [];
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
        .subscribe(
            r => {
                this.BuildData(r.body);
            },
            e => {
                console.error(e);
            }
        );
    }

    ngOnInit(){

        
    }

    ngOnChanges(changes) {
        //console.log('config panel');
        //console.log(this.paramIndex);
        //console.log(this.selectedSymbols);
        //console.log(changes);
        if(changes){
            if(changes.selectedSymbols){
                if(changes.selectedSymbols.currentValue && changes.selectedSymbols.currentValue.length > 0){
                    if(this.serverName !== changes.selectedSymbols.currentValue[this.paramIndex].props.serverName){
                        this.serverName = changes.selectedSymbols.currentValue[this.paramIndex].props.serverName;
                        this.Get();
                    }
                    if(changes.selectedSymbols.currentValue[this.paramIndex].props.elementEfAttr){
                        this.selectedELEF = changes.selectedSymbols.currentValue[this.paramIndex].props.elementEfAttr;
                    }
                }
            }
        }
    }

    HideShow(){
        this.isShow = !this.isShow;
    }

    GoUp(){
        //move to index -1 selectedRow
        const index_of_row = this.selectedELEF.indexOf(this.selectedelefRow);
        if(index_of_row > 0){
            this.selectedELEF = this.MoveIndexOf(this.selectedELEF, index_of_row, index_of_row - 1);
        }
    }

    GoDown(){
        //move to index + 1 selectedRow
        const index_of_row = this.selectedELEF.indexOf(this.selectedelefRow);
        if(index_of_row < this.selectedELEF.length-1){
            this.selectedELEF = this.MoveIndexOf(this.selectedELEF, index_of_row, index_of_row + 1);
        }
    }

    Add(){
        const to_add = {
            element: this.elementcategory,
            ef: this.EFtemplate,
            master: false,
            Color: '#b20000'
        }
        
        if(this.selectedELEF.length == 0){
            to_add.master = true;
        }

        const found = this.selectedELEF.find(x => x.element.WebId === this.elementcategory.WebId && x.ef.WebId === this.EFtemplate.WebId);
        if (found){
            return;
        }

        this.selectedELEF.push(to_add);

        
        if (!to_add.ef.attributesTemplate){
            this.GetAttributeFromEFTempate(this.elementcategory, this.EFtemplate);
        }

    }

    Delete(){
        this.selectedELEF = this.selectedELEF.filter(obj => obj.element.WebId !== this.selectedelefRow.element.WebId || obj.ef.WebId !== this.selectedelefRow.ef.WebId);
        if(this.selectedelefRow.master){
            if(this.selectedELEF.length>0){
                this.selectedELEF[0].master=true;
            } 
        }
    }

    SelectElement(item){
        this.elementcategory = this.elementsTOshow.find(x => x.WebId === item);
        this.EFtemplate = this.elementcategory.analysesTemplateEventType[0];
    }

    SelectEFType(item){
        this.EFtemplate = this.elementcategory.analysesTemplateEventType.find(x => x.WebId === item);
    }
    SelectEFELRow(item){
        this.selectedelefRow = item;
        
        this.listOfAttributeCategory = item.ef.attributesTemplateCategories;

        //const lstToDisplay = this.selectedelefRow.ef.attributesTemplate.filter();


        this.AttributeofselectedELEF = this.selectedelefRow.ef.attributesTemplate;
    }
    NewMaster(item){
        this.selectedELEF.forEach(x => {
            x.master=false;
        })
        item.master = true;

        const index_of_item = this.selectedELEF.indexOf(item);
        if(index_of_item < this.selectedELEF.length-1){
            this.selectedELEF = this.MoveIndexOf(this.selectedELEF, index_of_item, 0);
        }
    }
    PositionAttribute(item){
        
    }

    SubmitConf(){
        this.SendToComponent();
    }

    SendToComponent(){
        const body = [];

        this.selectedELEF.forEach(row => {
            let to_add = {
                element: {
                    Name: row.element.Name,
                    WebId: row.element.WebId
                },
                ef:{
                    WebId: row.ef.WebId,
                    Name: row.ef.Name,
                    attributesTemplate: [],
                    attributesTemplateCategories: []
                },
                Color: row.Color,
                master: row.master
            };

            if(row.ef.attributesTemplate){
                row.ef.attributesTemplate.forEach(attr => {
                    let add_attr = {
                        Name: attr.Name,
                        position: attr.position
                    };

                    to_add.ef.attributesTemplate.push(add_attr);
                });
            }

            if(row.ef.attributesTemplateCategories){
                row.ef.attributesTemplateCategories.forEach(attr_cat => {
                    to_add.ef.attributesTemplateCategories.push(attr_cat);
                });
            }
            body.push(to_add);
        });

        //{ props: { propName: value } , paramIndex: paramIdx }
        const message = {
            property: 'props',
            payload: {
                props: {
                    elementEfAttr: body
                },
                paramIndex: this.paramIndex
            }
        };
        this.changeSymbol.emit(message);
    }

    MoveIndexOf(arr, old_index, new_index){
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length;
            while ((k--) + 1) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);  
        return arr;
    }

    CheckPositionOfAttribute(attr){
        //const 
    }
}