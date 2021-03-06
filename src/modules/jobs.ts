export class Jobs {
  public static flushJobStatus() {
    console.log('Flushing job status...');

    return new Parse.Query('_JobStatus')
      .find({ useMasterKey: true })
      .then((results) => {
        return Parse.Object.destroyAll(results, { useMasterKey: true });
      }).then(() => {
        console.log('Job status flushed');
      });
  }

  /**
   * Returns a function that writes to consolo.log to request.message (v3)
   */
  public static getDefaultLoggingFunction(request: Parse.Cloud.JobRequest) {
    return (m) => console.log(m);
  }

  public static isJobRunning(jobName: string): Promise<number> {
    return new Parse.Query('_JobStatus')
      .equalTo('jobName', jobName)
      .equalTo('status', 'running')
      .find({ useMasterKey: true })
      .then((results) => {
        console.log('%i instances of job %s running', results.length, jobName);

        return results.length;
      });
  }
}
