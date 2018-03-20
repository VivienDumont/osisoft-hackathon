/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'extract-data',
  templateUrl: 'extract-data.component.html',
  styleUrls: ['extract-data.component.css']
})
export class ExtractDataComponent implements OnChanges {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  values: any[];

  ngOnChanges(changes) {
    console.log(changes);
  }

}
