import { Module } from "@nestjs/common";
import { GPTAnalysisService } from "./services/gpt-analysis.service";
import OpenAI from "openai";

@Module({
    imports:[OpenAI],
    providers:[GPTAnalysisService],
    exports:[GPTAnalysisService],
})
export class OpenAiModule {}