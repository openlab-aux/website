<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import deLocale from "@fullcalendar/core/locales/es";

export default {
  props: ["events"],
  components: {
    FullCalendar, // make the <FullCalendar> tag available
  },
  data() {
    return {
      calendarOptions: {
        initialView: "dayGridMonth",
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
        events: this.events.map((x) => ({
          title: x.title,
          date: x.starts_at,
          url: "/events/" + x.id,
        })),
        locale: "de",
        locales: [deLocale],
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridYear,dayGridMonth,timeGridWeek,timeGridDay,listYear",
        },
        eventTimeFormat: {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
        buttonText: {
          today: "Heute",
          year: "Jahr",
          month: "Monat",
          week: "Woche",
          day: "Tag",
          list: "Liste",
        },
        selectable: true,
        lazyFetching: true,
      },
    };
  },
};
</script>
<template>
  <FullCalendar :options="calendarOptions" />
</template>