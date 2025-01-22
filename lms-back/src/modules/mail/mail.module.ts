import { Module } from "@nestjs/common";
import { MailService } from "./services/mail.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true
      })],
     providers: [MailService],
     exports:[MailService]
})
export class MailModule{}