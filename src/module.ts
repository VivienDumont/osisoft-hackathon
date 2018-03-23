import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';

import { ExtractDataComponent } from './extract-data/extract-data.component';
import { DrawDataComponent } from './draw-data/draw-data.component'

import { PIWEBAPI_TOKEN } from 'framework';
import { PiWebApiService } from '@osisoft/piwebapi';

@NgModule({
  declarations: [ExampleComponent, DrawDataComponent, ExtractDataComponent ],
  imports: [ CommonModule ] ,
  exports: [ExampleComponent, DrawDataComponent, ExtractDataComponent ],
  entryComponents: [ExampleComponent, DrawDataComponent, ExtractDataComponent ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {

  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'draw-data-symbol',
      displayName: 'DrawData Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: DrawDataComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix,
      ],
      generalConfig: [
        {
          name: 'DrawData Options',
          isExpanded: true,
          configProps: [
            { propName: 'isMasterEvent', displayName: 'Is Master Event', configType: ConfigPropType.Flag, defaultVal: true },
            { propName: 'primaryEvent',  displayName: 'Primary Event', configType: ConfigPropType.Listbox,
            configItems: [
              { text: 'Downtime', value: 'downtime' },
              { text: 'Production', value: 'production'}
            ],
            defaultVal: 'production' },
            { propName: 'defaultEventHeight', displayName: 'Default Event Height', configType: ConfigPropType.Num, defaultVal: 50 },
            { propName: 'bkColor', displayName: 'Background', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'lineColor', displayName: 'Line Color', configType: ConfigPropType.Color, defaultVal: '#58a3b6' },
            { propName: 'startTimeCustom', displayName: 'Start Time', configType: ConfigPropType.Time },
            { propName: 'endTimeCustom', displayName: 'End Time', configType: ConfigPropType.Time },
            { propName: 'minimumEventPixelWidth', displayName: 'Min Event Width', configType: ConfigPropType.Num, defaultVal: 25 },
            { propName: 'showAttrInEventWidth', displayName: 'Event Width To Show Attr', configType: ConfigPropType.Num, defaultVal: true }
          ]
        }
      ],
      layoutWidth: 900,
      layoutHeight: 800
    },
    {
      name: 'extract-data-symbol',
      displayName: 'ExtractData Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExtractDataComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Extract Data Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'blue' }
          ]
        }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) {
    super();
   }
}
