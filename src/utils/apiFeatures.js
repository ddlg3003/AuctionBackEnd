class APIFeatures {
  constructor(query, queryStr, populate) {
    this.query = query;
    this.queryStr = queryStr;
    this.populate = populate;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing fields from the query
    const removeFields = ['keyword', 'limit', 'page', 'sort'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advance filter for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query
      .find(JSON.parse(queryStr))
      .select(
        'name description endTime currentPrice mainImage subImage1 subImage2 subImage3'
      );

    // Sort fields
    if (this.queryStr.sort && this.queryStr.sort === 'true') {
      this.query = this.query.sort('endTime');
    }

    if (this.populate) {
      this.query = this.query.populate(this.populate);
    }

    return this;
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
