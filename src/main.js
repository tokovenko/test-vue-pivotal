import Vue from 'vue'
import App from './App.vue'
import Pivot from '@marketconnect/vue-pivot-table';

const data = [
  {"country": "United States", "year": 2010, "gender": "male", "count": 153295220},
  {"country": "United States", "year": 2010, "gender": "female", "count": 156588400},
  {"country": "United States", "year": 2011, "gender": "male", "count": 154591960},
  {"country": "United States", "year": 2011, "gender": "female", "count": 157800200},
  {"country": "United States", "year": 2012, "gender": "male", "count": 155851840},
  {"country": "United States", "year": 2012, "gender": "female", "count": 158944800},
  {"country": "China", "year": 2010, "gender": "male", "count": 690256342},
  {"country": "China", "year": 2010, "gender": "female", "count": 650712406},
  {"country": "China", "year": 2011, "gender": "male", "count": 694106441},
  {"country": "China", "year": 2011, "gender": "female", "count": 654068030},
  {"country": "China", "year": 2012, "gender": "male", "count": 697964288},
  {"country": "China", "year": 2012, "gender": "female", "count": 657422649},
  {"country": "India", "year": 2010, "gender": "male", "count": 638354751},
  {"country": "India", "year": 2010, "gender": "female", "count": 592629727},
  {"country": "India", "year": 2011, "gender": "male", "count": 646873890},
  {"country": "India", "year": 2011, "gender": "female", "count": 600572093},
  {"country": "India", "year": 2012, "gender": "male", "count": 655193693},
  {"country": "India", "year": 2012, "gender": "female", "count": 608395922},
  {"country": "France", "year": 2010, "gender": "male", "count": 30675773},
  {"country": "France", "year": 2010, "gender": "female", "count": 32285363},
  {"country": "France", "year": 2011, "gender": "male", "count": 30815839},
  {"country": "France", "year": 2011, "gender": "female", "count": 32452566},
  {"country": "France", "year": 2012, "gender": "male", "count": 30948916},
  {"country": "France", "year": 2012, "gender": "female", "count": 32612882}
]

// Vue.use(Pivot)

new Vue({
  el: "#app",
  components: {
    Pivot
  },
  data: () => {
    return {
      data: data,
      query: '',
      asyncData: [],
      fields: [],
      rowFields: [{
        getter: item => item.country,
        label: 'Country'
      }, {
        getter: item => item.gender,
        label: 'Gender'
      }],
      colFields: [{
        getter: item => item.year,
        label: 'Year' 
      }],
      red: 'sum + item.count',
      defaultShowSettings: true,
      isDataLoading: false,
      table: null,
      sum: 0
    }
  },
  mounted () {
    const onChanged = () => {
      this.genSQL();
      setTimeout(() => {
        this.calcSum();
      }, 200);
    }
    
    const checker = (prop) => () => this.getPivotInternalDataByProp(prop);
    this.$watch(checker('rowFields'), () => onChanged());
    this.$watch(checker('colFields'), () => onChanged());
    onChanged();

    this.table = this.$refs.pivotTable.$children.find(i => 'valuesHashTable' in i);
  },
  created() {
    this.isDataLoading = true
    setTimeout(() => {
      this.asyncData = data
      this.isDataLoading = false
    }, 3000)
  },
  computed: {  
    percent() {
      return (col, row) => ((this.getCellValue(col, row) / this.sum * 100) || 0).toFixed(2);
    },
    reducer() {
      return (sum, item) => {
        try {
        return eval( this.red );
        } catch(e) {
        return 0;
        }
      }
    }
  },
  methods: {
    update() {
      this.data = [...this.data];
      setTimeout(() => this.calcSum(), 200);
    },
    getPivotInternalDataByProp(prop) {
      return this.$refs.pivotTable.internal[prop] || [];
    },
    genSQL() {
      const genSequnceString = list => list.map(item => item.label.toLowerCase()).join(', ');
      const rowFields = this.getPivotInternalDataByProp('rowFields');
      const colFields = this.getPivotInternalDataByProp('colFields');

      const querySelectString = genSequnceString(rowFields) || '*';
      const queryColFields = genSequnceString(colFields);
      const queryGroupString = queryColFields ? `group by ${queryColFields}` : '';    
      this.query = `select ${querySelectString} from ? ${queryGroupString}`;
    },
    calcSum() {
      const values = this.table.valuesHashTable.values || {};
      this.sum = Object.keys(values).reduce((sum, key) => sum + values[key], 0);
    },
    getCellValue(col, row) {
      const keys = {};
      const fillKeys = (key) => (v, i) => keys[`${key}-${i}`] = v;
      col.forEach(fillKeys('col'));
      row.forEach(fillKeys('row'));
      return this.table.valuesHashTable.get({...keys}) || 0;
    }
  }
})