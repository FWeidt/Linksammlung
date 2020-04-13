var app = new Vue({
    el: '#app',
    vuetify: new Vuetify({
        theme: {
          dark: false,
        },
      }),

    data: {
        apiUrl:"http://192.168.2.250:1880/api/",
        apiEndpoint: "set",
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
        }
     
    },
    methods: {
        toggle_add: function () {
            this.title = ''
            this.href = ''
            this.desc = ''
            this.favicon = ''
            this.category = ''
            this.updateEvent = false
            
            if (this.add) {
                this.add = false
            } else {
                this.add = true
            }
        },
        sendData: function () {
            if(this.updateEvent){
                this.apiEndpoint="update"
            }
            else{
                this.apiEndpoint="set"
            }

            axios.post(`${this.apiUrl}${this.apiEndpoint}`, {
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
            this.add = false
            this.updateEvent = false
            this.title = ''
            this.href = ''
            this.desc = ''
            this.favicon = ''
            this.category = ''

        },
        getData: function () {
            this.loading = true
            axios.get(`${this.apiUrl}get`)
                .then(response => {
                    this.links = response.data
                })
                .catch(() => {
                    this.errorLoading = true
                })
                .finally(() => {
                    this.loading = false
                    this.showAll()
                })
        },
        deleteData: function (id) {
            axios.delete(`${this.apiUrl}del`, {
                data: id
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
            this.title = link.title
            this.href = link.href
            this.desc = link.desc
            this.favicon = link.favicon
            this.category = link.category

        },
        filterLinks: function(c){
            this.filteredLinks = this.links.filter((value)=>{
                console.log(c)
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