import React, { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import './calendar.scss'

interface CalendarProps {
  visible: boolean
  startDate?: string
  endDate?: string
  onConfirm: (startDate: string, endDate: string) => void
  onClose: () => void
}

interface CalendarState {
  currentDate: Date
  selectedStartDate?: Date
  selectedEndDate?: Date
  months: Array<{
    year: number
    month: number
    days: Array<{
      date: Date
      day: number
      isCurrentMonth: boolean
      isSelected: boolean
      isStartOrEnd: boolean
      isInRange: boolean
    }>
  }>
}

export default class Calendar extends Component<CalendarProps, CalendarState> {
  state: CalendarState = {
    currentDate: new Date(),
    selectedStartDate: undefined,
    selectedEndDate: undefined,
    months: []
  }

  componentDidMount() {
    this.generateMonths()
  }

  componentDidUpdate(prevProps: CalendarProps) {
    if (prevProps.startDate !== this.props.startDate || prevProps.endDate !== this.props.endDate) {
      this.parsePropsDates()
    }
  }

  parsePropsDates = () => {
    const { startDate, endDate } = this.props
    let selectedStartDate: Date | undefined
    let selectedEndDate: Date | undefined

    if (startDate) {
      const [month, day] = startDate.split('-')
      selectedStartDate = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day))
    }

    if (endDate) {
      const [month, day] = endDate.split('-')
      selectedEndDate = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day))
    }

    this.setState({ selectedStartDate, selectedEndDate }, this.generateMonths)
  }

  generateMonths = () => {
    const { currentDate, selectedStartDate, selectedEndDate } = this.state
    const months = []

    for (let i = 0; i < 12; i++) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + i

      if (month > 11) {
        const nextYear = year + Math.floor(month / 12)
        const nextMonth = month % 12
        months.push(this.generateMonthDays(nextYear, nextMonth, selectedStartDate, selectedEndDate))
      } else {
        months.push(this.generateMonthDays(year, month, selectedStartDate, selectedEndDate))
      }
    }

    this.setState({ months })
  }

  generateMonthDays = (year: number, month: number, selectedStartDate?: Date, selectedEndDate?: Date) => {
    const days = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, -startDayOfWeek + i +1),
        day: 0,
        isCurrentMonth: false,
        isSelected: false,
        isStartOrEnd: false,
        isInRange: false
      })
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const isSelected = this.isDateSelected(date, selectedStartDate, selectedEndDate)
      const isStartOrEnd = this.isStartOrEndDate(date, selectedStartDate, selectedEndDate)
      const isInRange = this.isDateInRange(date, selectedStartDate, selectedEndDate)

      days.push({
        date,
        day,
        isCurrentMonth: true,
        isSelected,
        isStartOrEnd,
        isInRange
      })
    }

    return {
      year,
      month,
      days
    }
  }

  isDateSelected = (date: Date, startDate?: Date, endDate?: Date) => {
    if (!startDate) return false
    return this.isSameDay(date, startDate)
  }

  isStartOrEndDate = (date: Date, startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return false
    if (startDate && this.isSameDay(date, startDate)) return true
    if (endDate && this.isSameDay(date, endDate)) return true
    return false
  }

  isDateInRange = (date: Date, startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return false
    return date > startDate && date < endDate
  }

  isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return

    const { selectedStartDate, selectedEndDate } = this.state

    if (!selectedStartDate) {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: undefined
      }, this.generateMonths)
    } else if (!selectedEndDate) {
      if (date < selectedStartDate) {
        this.setState({
          selectedStartDate: date,
          selectedEndDate: undefined
        }, this.generateMonths)
      } else {
        this.setState({
          selectedEndDate: date
        }, this.generateMonths)
      }
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: undefined
      }, this.generateMonths)
    }
  }

  handleConfirm = () => {
    const { selectedStartDate, selectedEndDate } = this.state
    if (selectedStartDate && selectedEndDate) {
      const startDate = `${selectedStartDate.getMonth() + 1}-${selectedStartDate.getDate()}`
      const endDate = `${selectedEndDate.getMonth() + 1}-${selectedEndDate.getDate()}`
      this.props.onConfirm(startDate, endDate)
    }
  }

  formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  render() {
    const { visible, onClose } = this.props
    const { selectedStartDate, selectedEndDate, months } = this.state

    if (!visible) return null

    const nights = selectedStartDate && selectedEndDate 
      ? Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return (
      <View className='calendar-mask' onClick={onClose}>
        <View className='calendar-panel' onClick={(e) => e.stopPropagation()}>
          <View className='calendar-header'>
            <View className='calendar-close' onClick={onClose}>✕</View>
            {selectedStartDate && selectedEndDate && (
              <View className='calendar-selected'>
                <Text className='selected-text'>{this.formatDate(selectedStartDate)} - {this.formatDate(selectedEndDate)}</Text>
              </View>
            )}
          </View>

          <ScrollView scrollY className='calendar-body'>
            {months.map((month, monthIndex) => (
              <View key={monthIndex} className='calendar-month'>
                <View className='month-title'>
                  <Text className='month-text'>{month.year}年{month.month + 1}月</Text>
                </View>
                <View className='week-header'>
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <View key={index} className='week-day'>
                      <Text className='week-text'>{day}</Text>
                    </View>
                  ))}
                </View>
                <View className='days-grid'>
                  {month.days.map((day, dayIndex) => (
                    <View
                      key={dayIndex}
                      className={`day-cell ${day.isCurrentMonth ? 'current-month' : ''} ${day.isSelected ? 'selected' : ''} ${day.isStartOrEnd ? 'start-or-end' : ''} ${day.isInRange ? 'in-range' : ''}`}
                      onClick={() => this.handleDateClick(day.date, day.isCurrentMonth)}
                    >
                      <Text className={`day-text ${day.isCurrentMonth ? 'current' : ''}`}>
                        {day.day > 0 ? day.day : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View className='calendar-footer'>
            <View className='footer-info'>
              {nights > 0 && (
                <Text className='nights-text'>{nights}晚</Text>
              )}
            </View>
            <Button className='calendar-btn' onClick={this.handleConfirm}>完成</Button>
          </View>
        </View>
      </View>
    )
  }
}
