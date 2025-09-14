import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElevatorController } from './controllers/elevator.controller';
import { ElevatorService } from './services/elevator.service';
import { SchedulerService } from './services/scheduler.service';
import { TestScenariosService } from './services/test-scenarios.service';

@Module({
  imports: [],
  controllers: [AppController, ElevatorController],
  providers: [
    AppService,
    ElevatorService,
    SchedulerService,
    TestScenariosService,
  ],
})
export class AppModule {}
