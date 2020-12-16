/**
 * Helper class to manage files on the server
 */
export class Files {

  /**
   * Deletes a physical file from Parse Server.
   * @param ignoreError If `true`, don't throw any exception if a delete fails.
   * Default: `false`.
   */
  public static async deleteFile(file: Parse.File, ignoreError = false): Promise<void> {
    const url = file && file.url && file.url().replace(`${Parse.applicationId}/`, '');
    console.log('delete %o', url);
    if (!url) { return null; }

    try {
      await Parse.Cloud.httpRequest({
        headers: {
          'X-Parse-Application-Id': Parse.applicationId,
          'X-Parse-Master-Key': Parse.masterKey,
        },
        method: 'DELETE',
        url,
      });

    } catch (e) {
      const error = e as Parse.Cloud.HttpResponse;
      if (!ignoreError) {
        throw new Error(error.text);
      } else {
        console.error('Error on deleting file %o:\n%o', url, error.text);
      }
    }
  }

  /**
   * Compares two file arrays and returns the files that no longer exist in the new array.
   * @param oldArr Original file array
   * @param newArr New file array
   */
  public static getUnlinkedFiles(oldArr: Parse.File[], newArr: Parse.File[]) {

    function comparer(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other.url() === current.url();
        }).length === 0;
      };
    }

    const onlyInOld = oldArr.filter(comparer(newArr));
    return onlyInOld;
  }
  /**
   * Deletes the files that have been removed from an array field in an object.
   * @param originalObject The old object (obtained from `request.original`)
   * @param newObject newObject The modified object (obtained from `request.object`)
   * @param key Field that contains the array of files
   * @param ignoreError If `true`, don't throw any exception if a delete fails.
   * @returns Removed file count (if no error)
   */
  public static async removeUnlinkedFiles(
    originalObject: Parse.Object,
    newObject: Parse.Object,
    key: string,
    ignoreError = false): Promise<number> {

    if (!originalObject) { return Promise.resolve(0); }

    await Parse.Object.fetchAll([originalObject, newObject], { useMasterKey: true });

    const deleteFilePromises = [];
    const originalValue: Parse.File[] | Parse.File = originalObject.get(key) || [];
    const newValue: Parse.File[] | Parse.File = newObject.get(key) || [];

    // If this is an array key
    if (Array.isArray(originalValue) && Array.isArray(newValue)) {

      if (originalValue.length > newValue.length) {

        const toRemove = this.getUnlinkedFiles(originalValue, newValue);
        console.log('Removing %i unlinked files', toRemove.length);

        toRemove.forEach((file) => {
          const p = this.deleteFile(file, ignoreError);
          deleteFilePromises.push(p);
        });
      }

      const results = await Promise.all(deleteFilePromises);
      return results.length;
    } else if (newValue) {
      await this.deleteFile(originalValue as Parse.File, ignoreError);
      return 1;
    }

    return 0;
  }
}
