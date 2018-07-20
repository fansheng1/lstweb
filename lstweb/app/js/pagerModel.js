
class PagerModel {
	constructor(){
		this.page = 1;
		this.nr_page = 0;
		this.nr_captures = 0;
		this.page_size = 12;
	}

	recalcNumOfPages() {
		var a = this.nr_captures%this.page_size
		if (a==0) {
			this.nr_page = this.nr_captures / this.page_size
		}else{
			this.nr_page = (this.nr_captures + this.page_size ) / this.page_size
			this.nr_page = Math.floor(this.nr_page)
		}	
	}

	getPagerParams(str) {
		if(str === undefined){
			return "page="+this.page+"&pagesize="+this.page_size
		}else{
			return "page="+this.page+"&pagesize="+this.page_size +'&orderby='+str
		}
	}
	getPagerInfo() {
		return { page: this.page, pages: this.nr_page, page_size: this.page_size}
	}
	setPagerInfo(init_page, page_size, nr_captures) {
		this.nr_captures = nr_captures
		this.page_size = page_size
		this.recalcNumOfPages()

		if(init_page < 1 || init_page > this.nr_page){
			return
		}
		this.page = init_page
		if(page_size < 12 || page_size > this.nr_page){
			return
		}
	}
	setPagerNext(fwd, page_size) {
		if(fwd == true) {
			if(this.page < this.nr_page) {
				this.page++
			}
		} else if(fwd == false) {
			if(this.page > 1) {
				this.page--
			}
		}

		if(page_size > 0){
			this.page_size = page_size
			this.recalcNumOfPages()
		}
	}
	setPagerTo(page, page_size) {
		if(page < 1)
			return
		this.page = (page < this.nr_page) ? page : this.nr_page
		if(page_size > 0){
			this.page_size = parseInt(page_size)
			this.recalcNumOfPages()
		}
	}
}

