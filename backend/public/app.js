var app = new Vue({
    el: '#app',
    vuetify: new Vuetify({
        theme: {
          dark: false,
        },
      }),

    data: {
        //apiUrl:"http://192.168.2.125:3001/api",
        apiUrl:"http://localhost:3000/api",
        successSafe: false,
        successDelete: false,
        errorLoading: false,
        loading: true,
        edit: false,
        add: false,
        updateEvent: false,
        title: '',
        href: '',
        desc: '',
        category: '',
        favicon: '',
        links: [],
        filteredLinks: []
    },
    computed: {
        categories: function(){
            var c = []
            this.links.forEach((item)=>{
            if(!c.includes(item.category) && item.category != "")
                c.push(item.category)
           })
           return c
        },
            
    },
    methods: {
        clearData: function() {
            this.title = ''
            this.href = ''
            this.desc = ''
            this.favicon = ''
            this.category = ''
        },
        toggle_add: function () {
            this.clearData()
            this.updateEvent = false
            if (this.add) {
                this.add = false
            } else {
                this.add = true
            }
        },
        sendData: function () {
            if(this.updateEvent){
                axios.patch(this.apiUrl, {
                    "_id": this._id,
                    "title": this.title,
                    "href": this.href,
                    "category": this.category,
                    "desc": this.desc,
                    "favicon": this.favicon
                })
                    .catch(() => {
                        this.errorLoading = true
                    })
                    .finally(() => {
                        this.getData()
                        this.successSafe = true
                    })
            }
            else {
                axios.post(this.apiUrl, {
                    "title": this.title,
                    "href": this.href,
                    "category": this.category,
                    "desc": this.desc,
                    "favicon": this.favicon
                })
                    .catch(() => {
                        this.errorLoading = true
                    })
                    .finally(() => {
                        this.getData()
                        this.successSafe = true
                    })
            }
            this.add = false
            this.updateEvent = false
            this.clearData()
        },
        getData: function () {
            this.loading = true
            axios.get(this.apiUrl)
                .then(response => {
                    this.links = response.data
                    console.log(this.links)
                })
                .catch(() => {
                    this.errorLoading = true
                })
                .finally(() => {
                    this.loading = false
                    this.showAll()
                })
        },
        deleteData: function (link) {
            axios.delete(this.apiUrl, {
                data: {"_id":link._id}
            })
                .catch(() => {
                    this.errorLoading = true
                })
                .finally(() => {
                    this.getData()
                    this.successDelete = true
                })
        },
        preloadData: function (link) {
            this.add = true
            this.updateEvent = true
            this._id = link._id
            this.title = link.title
            this.href = link.href
            this.desc = link.desc
            this.favicon = link.favicon
            this.category = link.category
        },
        filterLinks: function(c){
            this.filteredLinks = this.links.filter((value)=>{

                return value.category == c                
            })
        },
        showAll: function(){
            this.filteredLinks = this.links
        }
    },
    mounted() {
        this.getData()

    },
    updated() {
        
    },
    watch: {
        successSafe: function () {
            setTimeout(() => {
                this.successSafe = false
            }, 2000)
        },
        successDelete: function () {
            setTimeout(() => {
                this.successDelete = false
            }, 2000)
        },
        errorLoading: function () {
            setTimeout(() => {
                this.errorLoading = false
                this.getData()
            }, 5000)
        },
    }
})