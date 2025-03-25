export default {
  data () {
    return {
      formErrors: {},
      isSubmitting: false
    }
  },
  methods: {
    validateField (field, value) {
      const rules = {
        email: v => /^[^@]+@\w+(\.\w+)+$/.test(v),
        required: v => !!v?.trim(),
        minLength: (v, length) => v.length >= length
      }

      if (!this.validationRules[field]) return true

      return this.validationRules[field].every(rule => {
        const [ruleName, ...params] = rule.split(':')
        return rules[ruleName](value, ...params)
      })
    },
    resetForm () {
      this.formErrors = {}
      this.isSubmitting = false
    }
  }
}