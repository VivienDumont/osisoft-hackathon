/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi';

@Component({
  selector: 'draw-data',
  templateUrl: 'draw-data.component.html',
  styleUrls: ['draw-data.component.css']
})
export class DrawDataComponent implements OnChanges, OnInit {
  @Input() primaryEvent: string;
  @Input() defaultEventHeight: number;
  @Input() bkColor: string;
  @Input() lineColor: string;
  @Input() isMasterEvent: boolean;
  @Input() startTimeCustom: string;
  @Input() endTimeCustom: string;
  @Input() minimumEventPixelWidth: number
  @Input() showAttrInEventWidth: number;

  // OSI PI input variables
  @Input() data: any;
  @Input() pathPrefix: string;
  // @Input() events: any;

  // global variable controls
  values: any[];
  element: any = {};
  eventTypes: any[];
  startTime: string;
  endTime: string;
  @ViewChild('eventsDiv') eventsDiv: ElementRef;
  currentViewWidth: number;
  oldviewWidth: number;
  eventHeight: string;
  shortestEventDuration: number;

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document: any, private _elRef: ElementRef) { }

  private GetEventFrames() {

    // tslint:disable-next-line:comment-format
    this.element.WebId = 'F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE' //Line1 webid
    
    const params = {
      startTime: this.startTime,
      endTime: this.endTime
    };
    this.piWebApiService.element
    .getEventFrames$(this.element.WebId, params)
    .subscribe(
      r => {
        this.values = r.Items;
      },
      e => {
        console.error(e);
      }
    );
  }

  // formatData() {
  //   if (this.isDataValid()) {
  //     return this.data.body.map(r => ({ path: r.path, value: this.formatValue(r.value) }));
  //   } else {
  //     return [];
  //   }
  // }

  private isDataValid(): boolean {
    return this.data && this.data.body && this.data.body.length;
  }

  public getPiVisionStartAndEndTime() {
    this.startTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[0].value;
    this.endTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[1].value;
  }

  ngOnInit() {
    setInterval(() => {
      this.getPiVisionStartAndEndTime();
      this.GetEventFrames();
      }, 5000);
    // this.GetEventFrames();
    // this.piWebApiService.element.getAnalyses$(this.element.WebId)
    // .subscribe(
    //   r => {
    //     this.element.analysesTemplateEventType = r.Items;
    //     r.Items.forEach(template => {
    //       if (template.AnalysisRulePlugInName === 'EventFrame') {
    //         this.element.analysesTemplateEventType.push(template);
    //       }
    //     });
    //   },
    //   e => {
    //     console.error(e);
    //   }
    // );
  }

  redrawComponent() {
    // const minEventDurSeconds = this
    let startTimeInMilliseconds = new Date(this.startTime).getTime();
    let endTimeInMilliseconds = new Date(this.endTime).getTime();
    this.shortestEventDuration = this.getShortestEventDuraion();
    console.log(`start time milliseconds: ${startTimeInMilliseconds}`);
    console.log(`end time milliseconds: ${endTimeInMilliseconds}`);
    console.log(`shortest event duration: ${this.shortestEventDuration}`);
    // (MinEventDurasioin/SmallestEventDuraion)*this.currentViewWidth > this.minimumEventPixelWidth
    // if(equation > this.minimumEventPixelWidth)
    // {

    // }
  }

  getShortestEventDuraion(): number {
    let startTimeCompare: number;
    let endTimeCompare: number;
    let shortestDuration: number;
    let loopDuration = 0;

    if (this.values !== undefined) {
      this.values.forEach(
        item => {
          startTimeCompare = new Date(item.StartTime).getTime();
          endTimeCompare = new Date(item.EndTime).getTime();
          loopDuration = (endTimeCompare - startTimeCompare);

          // is this the shortest duration so far, or is it the first itteration?
          if (loopDuration < shortestDuration || loopDuration === 0) {
            shortestDuration = loopDuration;
          }

        },
        e => {
          console.log(e);
        }
      )
    } else {

    }

    return shortestDuration;
  }

  // This method is used to check the size of the div
  ngAfterViewChecked() {
    this.currentViewWidth = this.eventsDiv.nativeElement.offsetWidth;

    if (this.currentViewWidth !== this.oldviewWidth) {
      this.oldviewWidth = this.currentViewWidth;
      console.log(`current width: ${this.currentViewWidth}`);
      this.redrawComponent();
    } else {
      // console.log("width unchanged");
    }
  }

  // ngDoCheck() {
  //   console.log('docheck');
  // }

  ngOnChanges(changes) {
    if (changes.data) {
      // this.values = this.formatData();
    }

    if (changes.primaryEvent) {
      console.log('Primary event changed');

    }

    if (changes.defaultEventHeight) {
      this.eventHeight = `${changes.defaultEventHeight}px`;
      console.log('height Changed');
    }

    this.GetEventFrames();
  }

}
