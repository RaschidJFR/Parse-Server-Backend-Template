export class Jobs {
	static flushJobStatus() {
		console.log('Flushing job status...');
		
		return new Parse.Query('_JobStatus')
			.find({ useMasterKey: true })
			.then(results => {
				return Parse.Object.destroyAll(results, { useMasterKey: true });
			}).then(()=>{
				console.log('Job status flushed');
			})
	}

	static isJobRunning(jobName: string): Parse.IPromise<number> {
		return new Parse.Query('_JobStatus')
			.equalTo('jobName', jobName)
			.equalTo('status', 'running')
			.find({ useMasterKey: true })
			.then(results => {
				console.log('%i instances of job %s running', results.length, jobName);

				return results.length;
			});
	}

	/**
	 * Returns a function that writes to consolo.log to JobStatus.message (v2) and request.message (v3)
	 */
	static getDefaultLoggingFunction(request: Parse.Cloud.JobRequest, status: Parse.Cloud.JobStatus) {
		// logging
		let logFunction;
		if (status && status.success) logFunction = (m) => { status.message(m); console.log(m); };
		else logFunction = (m) => { (request as any).message; console.log(m); }

		return logFunction;
	}
}