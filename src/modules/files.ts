/**
 * Helper class to manage files on the server
 */
export class Files {
	/**
	 * Deletes the files that have been removed from an array field in an object.
	 * @param originalObject The old object (obtained from `request.original`)
	 * @param newObject newObject The modified object (obtained from `request.object`)
	 * @param key Field that contains the array of files
	 * @returns Removed file count
	 */
	static removeUnlinkedFiles(originalObject: Parse.Object, newObject: Parse.Object, key: string): Promise<number> {
		if (!originalObject) return Promise.resolve(0);

		return Parse.Object.fetchAll([originalObject, newObject], { useMasterKey: true })
			.then(() => {

				const deleteFilePromises = [];
				const originalArr = originalObject.get(key) || [];
				const newArr = newObject.get(key) || [];

				if (originalArr.length > newArr.length) {

					let toRemove = this.getUnlinkedFiles(originalArr, newArr);
					console.log('Removing %i unlinked files', toRemove.length);

					toRemove.forEach(file => {
						const p = this.deleteFile(file);
						deleteFilePromises.push(p);
					});
				}

				return Promise.all(deleteFilePromises);

			})
			.then((results) => results.length);
	}

/**
	 * Deletes a physical file from Parse Server.
	 */
	static async deleteFile(file: Parse.File, ignoreError = false): Promise<void> {
		const url = file && file.url && file.url().replace(`${Parse.applicationId}/`, '');
		console.log('delete %o', url);
		if(!url) return null;

		try {
			await Parse.Cloud.httpRequest({
				url: url,
				method: 'DELETE',
				headers: {
					'X-Parse-Application-Id': Parse.applicationId,
					'X-Parse-Master-Key': Parse.masterKey,
				}
			});

		} catch (e) {
			const error = e as Parse.Cloud.HttpResponse;
			if (!ignoreError) {
				throw new Error(error.text);
			} else {
				console.error('Error on deleting file %o:\n%o', url, error.text);
			}
		};
	}

	/**
	 * Compares two file arrays and returns the files that no longer exist in the new array.
	 * @param oldArr Original file array
	 * @param newArr New file array
	 */
	static getUnlinkedFiles(oldArr: Parse.File[], newArr: Parse.File[]) {

		function comparer(otherArray) {
			return function (current) {
				return otherArray.filter(function (other) {
					return other.url() == current.url();
				}).length == 0;
			}
		}

		const onlyInOld = oldArr.filter(comparer(newArr));
		return onlyInOld;
	}
}