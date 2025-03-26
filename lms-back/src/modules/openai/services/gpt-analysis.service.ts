// services/gpt-analysis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import OpenAI from 'openai';
import { GPTFeedbackDto } from '../dto/gpt-feedback.dto';
import * as mammoth from 'mammoth';

@Injectable()
export class GPTAnalysisService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async extractPlainText(filePath: string): Promise<string> {
    // Read the DOCX file into a buffer
    const fileBuffer = await fs.readFile(filePath);
    
    // Use mammoth to extract raw text
    const { value: plainText } = await mammoth.extractRawText({ buffer: fileBuffer });
    
    return plainText;
  }

  async analyzeSubmission(
    requirementsPath: string,
    submissionPath: string
  ): Promise<GPTFeedbackDto> {
    const requirements = await fs.readFile(requirementsPath, 'utf8');
    const submission = await fs.readFile(submissionPath, 'utf8');

    const prompt = `
      You are an academic assistant tasked with analyzing a student's submission against professor's requirements.
      
      PROFESSOR'S REQUIREMENTS:
      ${requirements}

      STUDENT'S SUBMISSION:
      ${submission}

      Please analyze the submission and provide:
      1. A score out of 100
      2. Detailed feedback
      3. List of requirements that were met
      4. List of requirements that were missing or incomplete
      5. Specific suggestions for improvement

      Format your response as JSON with the following structure:
      {
        "score": number,
        "feedback": "detailed analysis",
        "matchedRequirements": ["requirement1", "requirement2"],
        "missingRequirements": ["requirement1", "requirement2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a strict but fair academic evaluator. You should be thorough in your analysis and maintain high academic standards."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return {
      score: analysis.score,
      feedback: analysis.feedback,
      matchedRequirements: analysis.matchedRequirements,
      missingRequirements: analysis.missingRequirements,
      suggestions: analysis.suggestions
    };
  }


  async analyzeMultipleSubmissions(
    requirementsPath: string | null,
    submissionPaths: string[]
  ): Promise<GPTFeedbackDto> {
    // Read contents of all files
    const submissions = await Promise.all(
      submissionPaths.map(path => this.extractPlainText(path))
    );

    // Combine submissions into a single text
    const combinedSubmission = submissions.join('\n\n---NEXT SUBMISSION---\n\n');

    // Read requirements if exists
    const requirements = requirementsPath 
      ? await this.extractPlainText(requirementsPath)
      : 'No specific requirements provided';

    const prompt = `
      You are an academic assistant tasked with analyzing student submissions against assignment requirements.
      
      ASSIGNMENT REQUIREMENTS:
      ${requirements}

      STUDENT SUBMISSIONS:
      ${combinedSubmission}

      Please analyze the submissions and provide:
      1. An overall score out of 100
      2. Detailed comprehensive feedback
      3. List of requirements that were met
      4. List of requirements that were missing or incomplete
      5. Specific suggestions for improvement

      Format your response as JSON with the following structure:
      {
        "score": number,
        "feedback": "detailed analysis",
        "matchedRequirements": ["requirement1", "requirement2"],
        "missingRequirements": ["requirement1", "requirement2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `;
    console.log(prompt)

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a strict but fair academic evaluator. You should be thorough in your analysis and maintain high academic standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return {
      score: analysis.score,
      feedback: analysis.feedback,
      matchedRequirements: analysis.matchedRequirements,
      missingRequirements: analysis.missingRequirements,
      suggestions: analysis.suggestions
    };
  }
}