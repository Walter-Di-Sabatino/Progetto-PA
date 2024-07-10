import { InferenceService } from '../services/inferenceService';
import axios from 'axios';
import { ContentService } from '../services/contentService';
import { DatasetService } from '../services/datasetService';
import { UserService } from '../services/userService';
import dotenv from 'dotenv';

const Queue = require('bull');

dotenv.config();  // Carica le variabili dal file .env

// Create a new Bull queue named 'inference' using the provided Redis URI
const inferenceQueue = new Queue('inference', process.env.REDIS_URI);

// Process jobs from the inference queue
inferenceQueue.process(async (job: { data: { datasetId: any; modelId: any; userId: any; }; id: any; progress: (arg0: { state: string; message: string; }) => void; }) => {
  const { datasetId, modelId, userId } = job.data;

  // Initialize service instances using Singleton pattern
  const inferenceService = InferenceService.getInstance();
  const contentService = ContentService.getInstance();
  const datasetService = DatasetService.getInstance();
  const userService = UserService.getInstance();

  // Retrieve the Inference service URL from environment variables
  const inferenceUrl = process.env.INFERENCE_URL;

  // Define initial job status
  const jobStatus = {
    state: 'running',
    error_code: 200,
    message: 'Job in progress',
  };

  // Notify job progress with initial status
  await job.progress(jobStatus);

  // Authorization check: Ensure userId is provided
  if (!userId) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 401;
    jobStatus.message = 'Error 401: Unauthorized';
    job.progress(jobStatus);
    return;
  }

  // Validation checks: Ensure datasetId and modelId are provided
  if (!datasetId || !modelId) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 400;
    jobStatus.message = 'Error 400: datasetId and modelId are required';
    job.progress(jobStatus);
    return;
  }

  // Fetch dataset by datasetId
  const dataset = await datasetService.getDatasetById(datasetId);

  // Dataset existence check
  if (!dataset) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 404;
    jobStatus.message = 'Error 404: Dataset not found';
    job.progress(jobStatus);
    return;
  }

  // Authorization check: Ensure userId has access to the dataset
  if (dataset.userId !== userId) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 403;
    jobStatus.message = 'Error 403: Unauthorized access to dataset';
    job.progress(jobStatus);
    return;
  }

  // Fetch contents associated with the dataset
  const contents = await contentService.getContentByDatasetId(datasetId);

  // Contents validation: Ensure contents are not null or undefined
  if (contents == null || contents === undefined) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 404;
    jobStatus.message = 'Error 404: getContentByDatasetId service returned null or undefined';
    job.progress(jobStatus);
    return;
  }

  // Calculate the cost of inference based on contents
  const cost = contentService.calculateInferenceCost(contents);

  // Fetch user by userId
  const user = await userService.getUserById(userId);

  // User existence check
  if (!user) {
    jobStatus.state = 'failed';
    jobStatus.error_code = 401;
    jobStatus.message = 'Error 401: Unauthorized';
    job.progress(jobStatus);
    return;
  }

  // Token check: Ensure user has sufficient tokens to perform the inference
  if (cost > user.tokens) {
    jobStatus.state = 'aborted';
    jobStatus.error_code = 401;
    jobStatus.message = 'Error 401: Unauthorized';
    job.progress(jobStatus);
    return;
  }

  // Prepare contents in JSON format for the inference service
  const jsonContents = contentService.reduceContents(contents);

  try {
    const maxContentLengthStr = process.env.MAX_CONTENT_LENGTH || "100 * 1024 * 1024";
    const maxContentLength = eval(maxContentLengthStr);

    const response = await axios.post(`${process.env.INFERENCE_URL}/predict`, { jsonContents, modelId }, {
      maxContentLength: maxContentLength, // Max content length allowed in the request
      maxBodyLength: maxContentLength // Max body length allowed in the request
    });

    // Handle response from the inference service
    if (response.data && response.data.hasOwnProperty('error') && response.data.hasOwnProperty('error_code')) {
      jobStatus.state = 'failed';
      jobStatus.error_code = response.data.error_code;
      jobStatus.message = `Error ${response.data.error_code}: ${response.data.error}`;
      job.progress(jobStatus);
      return;
    }

    // Update user tokens after deducting the inference cost
    let tokens = user.tokens - cost;
    await userService.updateUser(userId, { tokens });

    // Create an inference record using the Inference service
    const inference = await inferenceService.createInference({ ...job.data, cost, result: response.data, model: modelId });

    // Finalize job status as completed
    jobStatus.state = 'completed';
    jobStatus.message = 'Job completed';
    job.progress(jobStatus);

    // Return the created inference object
    return inference;
  } catch (error) {
    // Handle errors that occur during the inference process
    jobStatus.state = 'failed';
    jobStatus.error_code = 500;
    jobStatus.message = `Error: ${error}`;
    job.progress(jobStatus);
    return;
  }
});

// Export the inferenceQueue for use in other parts of the application
export default inferenceQueue;
