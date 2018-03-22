import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType, PIWEBAPI_TOKEN } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { PiWebApiService, Request, ElementItemsField } from '@osisoft/piwebapi';

import { ExampleComponent } from './example/example.component';
import { ExtractDataComponent } from './extract-data/extract-data.component';
import { DrawDataComponent } from './draw-data/draw-data.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from 'ngx-contextmenu'

@NgModule({
  declarations: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ContextmenuComponent ],
  imports: [ CommonModule, NgbModule.forRoot(), ContextMenuModule.forRoot() ] ,
  exports: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ContextmenuComponent ],
  entryComponents: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ContextmenuComponent ]
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
            { propName: 'primaryEvent',  displayName: 'Primary Event', configType: ConfigPropType.Custom,
            configItems: [
              { text: 'Downtime', value: 'downtime' },
              { text: 'Production', value: 'production'}
            ],
            defaultVal: 'production' },
            { propName: 'defaultEventHeight', displayName: 'Default Event Height', configType: ConfigPropType.Num, defaultVal: 50 },
            { propName: 'bkColor', displayName: 'Background', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'lineColor', displayName: 'Line Color', configType: ConfigPropType.Color, defaultVal: '#58a3b6' },
            { propName: 'height', displayName: 'Height Until Scroll', configType: ConfigPropType.Num, defaultVal: '100' },
            { propName: 'timeControl', displayName: 'Time Control', configType: ConfigPropType.Time },
            { propName: 'minimumEventPixelWidth', displayName: 'Min Event Width', configType: ConfigPropType.Num, defaultVal: true },
          ]
        }
      ],
      layoutWidth: 500,
      layoutHeight: 400
    },
    {
      name: 'extract-data-symbol',
      displayName: 'Extract Data Symbol',
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
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' },
            { propName: 'serverName', displayName: 'Server Name', configType: ConfigPropType.Text, defaultVal: 'PISRV01' }
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
