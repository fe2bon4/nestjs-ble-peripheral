import { Module } from '@nestjs/common';

import { PeripheralService } from './peripheral.service';

@Module({
  providers: [PeripheralService],
  exports: [PeripheralService],
})
export class PeripheralModule {}
