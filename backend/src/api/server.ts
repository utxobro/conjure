import express from 'express';
import cors from 'cors';
import { ChatRoomService } from '../services/chatRoom';
import { StorageService } from '../services/storage';
import { ChatRoomConfig, AgentCreationOptions } from '../types';
import os from 'os';
import { networkInterfaces } from 'os';
import { OpenAIService } from '../services/openai';
import { v4 as uuidv4 } from 'uuid';
import { getGameDevPrompt } from '../constants/gamedevprompt';
import { getWebAppAgentPrompt } from '../constants/webappagentprompt';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const storageService = new StorageService();



// Interactive chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      prompt, 
      previousMessages = [], 
      siteStructure = [], 
    } = req.body;

    // First, let's check if we need images
    const imageDecisionMessages = [
      { 
        role: "system", 
        content: `You are an AI that determines if a web development task will need images.
        Analyze the conversation and current request to determine:
        1. If images will be needed (return needsImages: true/false)
        2. If needed, provide an optimized image search query under 80 chars (return imageQuery: string)
        3. Explain your reasoning (return explanation: string)
        4. How many images might be needed (return imageCount: number, max 5)

        Common cases where images are needed:
        - Creating new pages (usually need header/hero images)
        - Adding sections about products/services
        - Creating galleries or portfolios
        - Adding team member photos
        - Creating about us pages
        - Adding testimonials with profile pictures
        -any page updates or page chages 

        make sure to anaylze the conversation and the request and determine if images are needed. Like if any site updates are going to be made. 
  MAKE SURE TO RETURN THE JSON STRING REPRESENTATION OF THE JSON OBJECT AN NOTHING ELSE. THERE SHOULD BE NO OTHER TEXT OR COMMENTS BEFORE OR AFTER THE JSON OBJECT. or anything before or after the json brackets return you anwser in perfect json tat is directly ready to be parsed by the frontend.

        Return your response as a JSON object with these fields. Retrun nothing else other than the JSON with no other comments or text before or after  the brackets or anyhting else ofther than  paraable JSON:
        {
          "needsImages": boolean,
          "imageQuery": string (only if needsImages is true),
          "imageCount": number (only if needsImages is true),
          "explanation": string
        }` 
      },
      ...previousMessages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: prompt }
    ];

    // Make decision about images
    const imageDecisionResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o',
      messages: imageDecisionMessages,
      max_tokens: 10000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
      }
    });

    const imageDecision = JSON.parse(imageDecisionResponse.data.choices[0].message?.content);
    console.log(imageDecision);
    let imageUrls = [];

    // Create previousMessagesMap
    const previousMessagesMap = JSON.stringify(previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));
    const imageUrlsString = imageUrls.length > 0 ? `\n\nAvailable images for your use only use these images for static content Use only the provided Pixabay images for static content. Each image object contains a 'url' and 'alt' property. Use these properties to add relevant images to the generated content.
    \n${JSON.stringify(imageUrls, null, 2)}` : '';

    // Now make the main chat request with image information if available
    const messages = [
      { 
        role: "system", 
        content: getWebAppAgentPrompt(siteStructure, previousMessagesMap, imageUrlsString)
          
      },
      { role: "user", content: prompt }
    ];

    console.log( getWebAppAgentPrompt(siteStructure, previousMessagesMap, imageUrlsString));
    const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: messages,
      max_tokens: 8192,
      temperature: 1.0,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
      }
    });

    // Parse and send response
    const response = JSON.parse(completion.data.choices[0].message?.content);
    
    // Add image decision and urls to response
    response.imageDecision = imageDecision;
    if (imageUrls.length > 0) {
      response.imageUrls = imageUrls;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Host site endpoint
app.post('/api/host', async (req, res) => {
  try {
    const { pages, metadata } = req.body;
    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({ error: 'Pages array is required' });
    }

    // Generate unique ID for the site
    const siteId = uuidv4();
    
    // Use the storage service to host the site
    const result = await storageService.hostSite(pages, siteId, {
      name: metadata?.name || pages[0]?.name || 'Untitled Site',
      description: metadata?.description || 'A generated website',
      topics: metadata?.topics || ['web'],
      messageCount: metadata?.messageCount || 0,
      ...metadata
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error hosting site:', error);
    res.status(500).json({ error: 'Failed to host site' });
  }
});

// Sites
app.get('/api/sites', async (req, res) => {
  try {
    const startAfter = req.query.startAfter as string | undefined;
    const sites = await storageService.listSites(startAfter);
    res.json(sites);
  } catch (error) {
    console.error('Error listing sites:', error);
    res.status(500).json({ error: 'Failed to list sites' });
  }
});

app.get('/api/recentsites', async (req, res) => {
  try {
    const sites = await storageService.listRecentSites();
    res.json(sites);
  } catch (error) {
    console.error('Error listing sites:', error);
    res.status(500).json({ error: 'Failed to list sites' });
  }
});

app.get('/api/sites/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = await storageService.getSite(siteId);
    res.json(site);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});























const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






export default app; 






