/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, ElementRef, Inject, OnInit, ViewChild, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi';


@Component({
  selector: 'draw-data',
  templateUrl: 'draw-data.component.html',
  styleUrls: ['draw-data.component.css']
})
export class DrawDataComponent implements OnChanges, OnInit, OnDestroy {
  @Input() primaryEvent: string;
  @Input() defaultEventHeight: number;
  @Input() bkColor: string;
  @Input() lineColor: string;
  @Input() isMasterEvent: boolean;
  @Input() startTimeCustom: string;
  @Input() endTimeCustom: string;
  @Input() minimumEventPixelWidth: number
  @Input() showAttrInEventWidth: number;

  @Input() elementEfAttr: any;

  // OSI PI input variables
  @Input() data: any;
  @Input() pathPrefix: string;
  // @Input() events: any;

  // global variable controls
  eventFrames: any[];
  eventFrames1: any[];
  element: any = {};
  eventTypes: any[];
  element_ef: any = [];

  startTime: string;
  endTime: string;

  startTimeMaster: string;
  endTimeMaster: string;

  @ViewChild('eventsDiv') eventsDiv: ElementRef;
  @ViewChild('view')      viewDiv: ElementRef;
  currentViewWidth: number;
  oldviewWidth: number;
  eventHeight: string;
  shortestEventDuration: number;
  minControlWidth: any;
  showTimeMenu: boolean = false;

  inProgress = true;
  scrollState = {};
  widthControl = {};
  completed = true;
  scrollOn: boolean;
  stop_search: boolean = false;
  isByTime: boolean = false;
  

  setInt: any;

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService,
              @Inject(DOCUMENT) private document: any,
              private _elRef: ElementRef,
              private renderer: Renderer2,
              private changeDetector: ChangeDetectorRef) {

  }

  toggleCategoryMenu(index: number): void {
    // tslint:disable-next-line:max-line-length
    this.element_ef[index].showMenu = (this.element_ef[index].showMenu) ? !this.element_ef[index].showMenu : true;

    // this.element_ef[index].showMenu = !this.element_ef[index].showMenu;
  }

  openGridDisplay(Id: string, index: number): void {
    // tslint:disable-next-line:max-line-length
    let url: string = 'display?id=F1EmwcQX-gVflkWbQKYW5nMT5Qvs6AcM0t6BGpYAANOjr-FgUElTUlYwMVxQSSBWSVNJT05cUEkgVklTSU9OXERPQ1VNRU5UU1xWRFVNT05UL1RFU1Qx';
    url += `&webidEF=${this.getMostRecentEventByElementId(index)}`;
    url += `&navigationState=${(this.isByTime) ? 'time' : '3events'}`;
    // if (this.isByTime) {
    //   url += `&startTime=${this.startTimeMaster}`;
    //   url += `&endTime=${this.endTimeMaster}`;
    // }
    window.open(url, '_blank');
    this.element_ef[index].showMenu = (this.element_ef[index].showMenu) ? !this.element_ef[index].showMenu : true;
  }

  GoBefore(){
    if(this.isByTime){
      const date_m24 = new Date(this.element_ef[0].eventframes[0].StartTime);
      date_m24.setHours(date_m24.getHours() -24);
      this.startTimeMaster = date_m24.toISOString();
      this.endTimeMaster = this.element_ef[0].eventframes[0].StartTime;
    } else {
      this.startTimeMaster = this.element_ef[0].eventframes.find(ef => !ef.isBlank).StartTime;
    }
    //clearInterval(this.intervalNum);

    //make the call to method of the loop
    this.GetEventFramesMaster();
    //this.GetEventFrames();

    // this.intervalNum = setInterval(() => {
    //   this.GetEventFrames();
    // }, 10000);
  }

  GoAfter(){
    if(this.element_ef[0].eventframes[this.element_ef[0].eventframes.length-1].EndTime !== '-'){
      
      this.startTimeMaster = this.element_ef[0].eventframes[this.element_ef[0].eventframes.length-1].EndTime;
      const date_p24 = new Date(this.element_ef[0].eventframes[this.element_ef[0].eventframes.length-1].EndTime);
      date_p24.setHours(date_p24.getHours() + 24);
      this.endTimeMaster = date_p24.toISOString();
      //clearInterval(this.intervalNum);

      //make the call to method of the loop
      this.GetEventFramesMaster('ForwardFromStartTime');
      // this.GetEventFrames('ForwardFromStartTime');

      // this.intervalNum = setInterval(() => {
      //   this.GetEventFrames('ForwardFromStartTime');
      // }, 10000);
    }
  }

  private GetEventFramesMaster(searchMode: string = 'BackwardFromStartTime') {
    
    let url = '';
    let master_row = this.elementEfAttr[0];
    let masterWebId = master_row.element.WebId;
    let eftype = master_row.ef.Name;

    if(!this.startTimeMaster){
      let now = new Date();
      now.setHours(now.getHours() - 8);
      this.startTimeMaster = now.toUTCString();
    }
    if(!this.endTimeMaster){
      this.endTimeMaster = new Date().toUTCString();
    }

    if(this.isByTime) {
      url = `https://pisrv01.pischool.int/piwebapi/elements/${masterWebId}/eventframes?starttime=${this.startTimeMaster}&endtime=${this.endTimeMaster}&searchMode=Inclusive`;
    } else {
      url = `https://pisrv01.pischool.int/piwebapi/elements/${masterWebId}/eventframes?starttime=${this.startTimeMaster}&searchMode=${searchMode}`;
    }

    const body = {
      "0":{
        "Method": "GET",
        "Resource": url
      }
    };

    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        if(r.body[0].Content.Items.length == 0){
          return;
        }
        
        let items_master = r.body[0].Content.Items.filter(x => x.TemplateName === eftype || x.TemplateName.indexOf(eftype)+1 || eftype.indexOf(x.TemplateName)+1);
        
        if(!this.isByTime){
          items_master = items_master.slice(0,3);
        }
        
        if(searchMode === 'BackwardFromStartTime'){
          items_master = items_master.reverse();
        }

        this.element_ef = [];
        
        items_master.forEach(i => {
          this.GetAttributeAndValue(i, 0);
        });

        if(this.isByTime){
          this.startTime = this.startTimeMaster;
          this.endTime = this.endTimeMaster;
        } else {
          this.startTime = items_master[0].StartTime;
          this.endTime = items_master[items_master.length-1].EndTime;
          if(this.endTime.indexOf('9999')+1){
            this.endTime = new Date().toString();
          }
        }
        

        this.AddBlankEvent(items_master);

        this.element_ef[0] = {
          elementName: this.elementEfAttr[0].element.Name,
          eventTypeName: this.elementEfAttr[0].ef.Name,
          efWebId: this.elementEfAttr[0].ef.WebId,
          eventframes: items_master,
          Color: this.elementEfAttr[0].Color,
          attributesTemplateCategories: this.elementEfAttr[0].ef.attributesTemplateCategories
        };


        this.GetEventFrames();
      },
      e => {
        console.error(e);
      }
    );
  }

  private GetEventFrames() {
    if (this.stop_search || !this.elementEfAttr) {
      return;
    }

    const body = {};

    this.elementEfAttr.forEach((element, index) => {
      if(index > 0){
        body[""+index] = {
          'Method': 'GET',
          'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${element.element.WebId}/eventframes?starttime=${this.startTime}&endtime=${this.endTime}`
        }
      }
    });

    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        //this.element_ef = [];
        let index = 1;
        let req = r.body[index];
        while(req){
          if(req.Content.Items){
            const items = req.Content.Items.filter(x => x.TemplateName === this.elementEfAttr[index].ef.Name 
                                                || x.TemplateName.indexOf(this.elementEfAttr[index].ef.Name) + 1
                                                || this.elementEfAttr[index].ef.Name.indexOf(x.TemplateName) + 1);
            items.forEach(i => {
              this.GetAttributeAndValue(i, index);
            });
            this.AddBlankEvent(items);

            this.element_ef[index] = {
              elementName: this.elementEfAttr[index].element.Name,
              eventTypeName: this.elementEfAttr[index].ef.Name,
              efWebId: this.elementEfAttr[index].ef.WebId,
              eventframes: items,
              Color: this.elementEfAttr[index].Color,
              attributesTemplateCategories: this.elementEfAttr[index].ef.attributesTemplateCategories
            };
            
          }
          
          index++;
          req = r.body[index];
        }
        this.redrawComponent();
      },
      e => {
        console.error(e);
      }
    );
  }

  GetAttributeAndValue(eventframe, index){
    this.piWebApiService.eventFrame.getAttributes$(eventframe.WebId)
    .subscribe(
      r => {
        let lst_toAdd = [];
        const lst_attr = r.Items;
        const lst_of_attr_conf = this.elementEfAttr[index].ef.attributesTemplate;  

        lst_attr.forEach(a => {
          if (lst_of_attr_conf.length > 0) {
            const found = lst_of_attr_conf.find(x => x.Name === a.Name && x.position);
            if(found){
              this.piWebApiService.stream.getValue$(a.WebId)
              .subscribe(
                r_a => {
                  if(found.position > 0){
                    eventframe["slot" + found.position] = a.Name + ' : ' + r_a.Value;
                  }
                },
                e_a => {
                  console.error(e_a);
                }
              );

            }

          }
          if (a.Name.indexOf('EventFrameColor') + 1) {
            this.piWebApiService.stream.getValue$(a.WebId)
            .subscribe(
              subs => {
                if (subs.Value) {
                  eventframe.bordercolor = subs.Name.toLowerCase();
                }
              }
            )
          }

        });
      },
      e => {
        console.error(e);
      }
    );
  }

  //
  public getMostRecentEventByElementId(index: number): string {
    let lastEvent =  this.element_ef[index].eventframes[this.element_ef[index].eventframes.length-1];
    if (lastEvent.isBlank) {
      lastEvent =  this.element_ef[index].eventframes[this.element_ef[index].eventframes.length-2];
    }
    const webid = lastEvent.WebId;

    return webid;
  }

  public AddBlankEvent(eventframes){
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);

    if (eventframes.length > 0) {
      let temp_start = start;
      let temp_end = new Date(eventframes[0].StartTime);

      for (let index = 0; index < eventframes.length; index++) {
        const ef = eventframes[index];
        let next_ef = false;

        if (temp_start < new Date(ef.StartTime)) {
          const blankEF = {
            StartTime: temp_start.toString(),
            EndTime: temp_end.toString(),
            isBlank: true
          };

          eventframes.splice(index, 0, blankEF);
          index++;
          next_ef = true;
        }

        temp_start = new Date(ef.EndTime);
        temp_end = new Date( (eventframes[index + 1]) ? eventframes[index + 1].StartTime : end )
      }

    } else {
      eventframes[0] = {
        StartTime: start.toString(),
        EndTime: end.toString(),
        isBlank: true
      };
    }
  }

  IsBlank(ef) {
    if (ef.isBlank) {
      return ef.isBlank;
    }
    return false;
  }

  // public getPiVisionStartAndEndTime() {
  //   const all_input_datetime = this.document.querySelectorAll('pv-datetime input[type="text"]');
  //   this.startTime = all_input_datetime[all_input_datetime.length - 2].value;
  //   this.endTime = all_input_datetime[all_input_datetime.length - 1].value;

  //   this.stop_search = new Date(this.endTime) < new Date(this.startTime);
    // tslint:disable-next-line:max-line-length
    // let dateRegEx;
    // -----THIS IS FOR RELATIVE DATE CONFIGURATION --- NOT QUITE WORKING YET
    // new RegExp('([\d\w-.]+?\.(a[cdefgilmnoqrstuwz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvxyz]|d[ejkmnoz]|e[ceghrst]|f[ijkmnor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eouw]|s[abcdeghijklmnortuvyz]|t[cdfghjkmnoprtvwz]|u[augkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]|aero|arpa|biz|com|coop|edu|info|int|gov|mil|museum|name|net|org|pro)(\b|\W(?<!&|=)(?!\.\s|\.{3}).*?))(\s|$)')

    // if (!dateRegEx.test(this.startTime)) {
    //   console.log('start date is relative');
    //   this.getAbsoluteDateFromRelativeTime(this.startTime);
    // }

    // if (!dateRegEx.test(this.endTime)) {
    //   console.log('start date is relative');
    //   this.getAbsoluteDateFromRelativeTime(this.endTime);
    // }
  // }

  redrawComponent() {
    const timeManipulator = 100;

    let startTimeInMilliseconds = new Date(this.startTime).getTime() / timeManipulator;
    let endTimeInMilliseconds = new Date(this.endTime).getTime() / timeManipulator;
    let durationInMilliseconds = (endTimeInMilliseconds - startTimeInMilliseconds);

    this.shortestEventDuration = this.getShortestEventDuraion() / timeManipulator;

    console.log('calulation result: ' + ((this.shortestEventDuration / durationInMilliseconds) * this.currentViewWidth))
    // We are able to fit all of the events within the symbol view without going below the smallest pixel size allowed
    if ( ((this.shortestEventDuration / durationInMilliseconds) * this.currentViewWidth) > this.minimumEventPixelWidth) {
      this.minControlWidth = 'inherit';

      this.widthControl = {
        'width': 'inherit'
      }

      this.switchScrollState(false);
      // console.log('no need for scroll bar');
      this.element_ef.forEach(element => {
        if (element.eventframes) {
          let inProgressTime = '9999';
          
          
          element.eventframes.forEach(item => {
            const start = new Date(item.StartTime).getTime();
            const end = new Date(item.EndTime).getTime(); //check if in progress before date object
            // tslint:disable-next-line:max-line-length
            if (item.EndTime.toString().indexOf(inProgressTime) > 0) {
              item.durationString = 'In Progress';
            } else {
              item.duration = ( (end) - (start) );

              item.durationString = this.getDurationString(item.duration);
            }

            item.width = ((( (end - start) ) / durationInMilliseconds) * this.currentViewWidth);
            // tslint:disable-next-line:max-line-length
            if (item.width >= this.showAttrInEventWidth) {
              item.showAttr = true;
            } else {
              item.showAttr = false;
            }
          },
          e => {
            console.log(e);
          }
          )
          //
        }
      });

      return
    } else { // Unable to fit all of the events within the symbol view withouth going below minimum pixel width
      // turn scroll on, reset the width of the symbol and resize the events based on the controls new width
      const updatedWidth = ( durationInMilliseconds * (this.minimumEventPixelWidth / this.shortestEventDuration) )
      // this.minControlWidth = `${updatedWidth}px`;
      this.widthControl = {
        'width': `${updatedWidth}px`
      }

      console.log(`screen size too small to display properly`);
      this.switchScrollState(true);

      this.element_ef.forEach(element => {
        if (element.eventframes) {
          let inProgressTime = '9999'

          element.eventframes.forEach(item => {
              const start = new Date(item.StartTime).getTime();
              const end = new Date(item.EndTime).getTime();  //check if in pogress before making date object
              // tslint:disable-next-line:max-line-length

              if (item.EndTime.toString().indexOf(inProgressTime) > 0) {
                item.durationString = 'In Progress';
              } else {
                item.duration = ((end) - (start));

                item.durationString = this.getDurationString(item.duration);
              }
              // tslint:disable-next-line:max-line-length
              item.width = (( ((end - start)) / durationInMilliseconds) * updatedWidth);
              if (item.width >= this.showAttrInEventWidth) {
                item.showAttr = true;
              } else {
                item.showAttr = false;
              }
            },
            e => {
              console.log(e);
            }
          )
        }
      });
    }
  }

  getDurationString(Milliseconds: number): string {
    // let seconds: number  = (Milliseconds / 1000) % 60 ;
    // let minutes: number = ((Milliseconds / (1000 * 60)) % 60);
    // let hours: number   = ((Milliseconds / (1000 * 60 * 60)) % 24);
    // return `${this.precisionRound(hours, -1)}:${this.precisionRound(minutes, -1)}:${this.precisionRound(seconds, -1)}`;

    let seconds = Milliseconds / 1000;
    // 2- Extract hours:
    let hours = seconds / 3600 ; // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes = seconds / 60; // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return `${Math.round(hours)}:${Math.round(seconds)}:${Math.round(minutes)}`;

  }

  precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  getShortestEventDuraion(): number {
    let startTimeCompare: number;
    let endTimeCompare: number;
    let shortestDuration = 0;
    let loopDuration = 0;

    this.element_ef.forEach(element => {
      if (element.eventframes !== undefined) {
        element.eventframes.forEach(
          eventFrame => {
            startTimeCompare = new Date(eventFrame.StartTime).getTime();
            endTimeCompare = new Date(eventFrame.EndTime).getTime();
  
            if (loopDuration === 0) {
              loopDuration = (endTimeCompare - startTimeCompare);
              shortestDuration = loopDuration
            } else {
              loopDuration = (endTimeCompare - startTimeCompare)
            }
  
            // is this the shortest duration so far, or is it the first itteration?
            if (loopDuration < shortestDuration) {
              shortestDuration = loopDuration;
            }
  
          },
          e => {
            console.log(e);
          }
        )
      } else {
        console.log(`no event frames to show`);
      }
    });

    
    return shortestDuration;
  }

  getAbsoluteDateFromRelativeTime(dateString: string): string {
    let relDateStringArray: string[] = dateString.split('')
    let dateObject = new Date();
    console.log(relDateStringArray);
    let startChar = relDateStringArray[0];
    let mathSignChar = relDateStringArray[1];
    let numberChar: any = relDateStringArray[2];
    let rangeTypeChar = relDateStringArray[3];

    console.log(startChar + mathSignChar + numberChar + rangeTypeChar);
    // set starting day
    if (startChar === '*') {
      dateObject.toDateString();
    } else if (startChar.toLowerCase() === 't') {
      // Set the hours to midnight
      dateObject.setHours(0, 0 , 1);

    } else if (startChar.toLowerCase() === 'y')  {
      dateObject.setHours(0, 0 , 1);
      let day = dateObject.getDay();

      // set the day one day ago
      dateObject.setDate(day - 1)
    } else {
      console.log('incorrect date string');
    }
    return dateString;
  }

  

    // this method is for NgClass. we can use this when we want to change the class of a component based on if it is in progress or not.
  switchScrollState(scroll: boolean) {
    this.scrollState = {
      'scroll-on' : scroll,
      'scroll-off' : !scroll
    }
  }

  setCurrentStyles() {
    this.widthControl = {
      'width': this.isMasterEvent ? 'normal' : 'bold'
    }
  }

  // -------------------ANGUALR EVENTS--------------
  ngOnInit() {
    this.ReSetInterval();
    // this.viewDiv.nativeElement.onscroll = function(e){
    //   console.log('is scrolling');
    //   console.log(e);
    // }
  }

  ngOnDestroy() {
    clearInterval(this.setInt);
  }

  // This method is used to check the size of the div
  ngAfterViewChecked() {
    // this.currentViewWidth = this.eventsDiv.nativeElement.offsetWidth;
    this.currentViewWidth = this.viewDiv.nativeElement.offsetWidth;
    if (this.currentViewWidth !== this.oldviewWidth) {
      this.oldviewWidth = this.currentViewWidth;
      this.redrawComponent();
    } else {
    }
  }

  ngOnChanges(changes) {
    console.log('drawdata');
    console.log(changes);
    if (changes.data) {
      // this.values = this.formatData();
    }

    if (changes.primaryEvent) {

    }

    if (changes.defaultEventHeight) {
      this.eventHeight = `${changes.defaultEventHeight}`;
      console.log(`new event height: ${this.eventHeight}`);
    }

    if (changes.elementEfAttr) {
      if (changes.elementEfAttr.currentValue) {
        console.log('element ef attr');
        this.elementEfAttr = changes.elementEfAttr.currentValue;
        this.ReSetInterval();
      }
    }

    //this.GetEventFrames();
  }

  ReSetInterval() {
    this.GetEventFramesMaster();
    // this.getPiVisionStartAndEndTime();
    // this.GetEventFrames();
    // this.changeDetector.detectChanges();
    // this.setInt = setInterval(() => {
    //   this.getPiVisionStartAndEndTime();
    //   this.GetEventFrames();
    //   this.changeDetector.detectChanges();
    //   }, 30000);
  }

  getColorByBgColor(bgColor) {
    if (!bgColor) { return ''; }
    return (parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2) ? '#000' : '#fff';
  }
}
