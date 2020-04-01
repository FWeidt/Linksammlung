var app = new Vue({
    el: '#app',
    vuetify: new Vuetify({
        theme: {
          dark: false,
        },
      }),

    data: {
        successSafe: false,
        successDelete: false,
        errorLoading: false,
        loading: true,
        edit: false,
        add: false,
        title: '',
        href: '',
        desc: '',
        category: '',
        favicon: '',
        links: []
    },
    computed: {

    },
    methods: {
        toggle_add: function () {
            if (this.add) {
                this.add = false
            } else {
                this.add = true
            }
        },
        sendData: function () {
            axios.post('http://192.168.2.250:1880/api/set', {
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
            this.title = ''
            this.href = ''
            this.desc = ''
            this.favicon = ''
            this.category = ''

        },
        getData: function () {
            this.loading = true
            axios.get("http://192.168.2.250:1880/api/get")
                .then(response => {
                    this.links = response.data
                })
                .catch(() => {
                    this.errorLoading = true
                })
                .finally(() => {
                    this.loading = false
                    console.log(this.links)
                })
        },
        deleteData: function (id) {
            axios.delete('http://192.168.2.250:1880/api/del', {
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
        updateData: function (item) {
            
        },
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