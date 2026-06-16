package com.eventify.config;

import com.eventify.model.AdminAccount;
import com.eventify.model.Event;
import com.eventify.model.EventPlan;
import com.eventify.repo.AdminAccountRepository;
import com.eventify.repo.EventRepository;
import com.eventify.repo.EventPlanRepository;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataBootstrap {

  @Bean
  ApplicationRunner seedData(
      AdminAccountRepository adminAccountRepository,
      EventRepository eventRepository,
      EventPlanRepository eventPlanRepository,
      PasswordEncoder passwordEncoder) {
    return args -> {
      if (adminAccountRepository.count() == 0) {
        AdminAccount admin = new AdminAccount();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        adminAccountRepository.save(admin);
      }

      ensureSeedEvents(eventRepository);
      ensureSeedPlans(eventPlanRepository);
    };
  }

  private static void ensureSeedEvents(EventRepository eventRepository) {
    ensureEvent(
        eventRepository,
        ev(
            1L,
            "Corporate",
            "Leadership & Strategy",
            "Leaders Connect India 2026",
            "10 May 2026",
            "Pune",
            "conference",
            220));
    ensureEvent(
        eventRepository,
        ev(
            2L,
            "Corporate",
            "Founder & Investor Networking",
            "Startup Networking Arena",
            "15 May 2026",
            "Mumbai",
            "meeting",
            160));
    ensureEvent(
        eventRepository,
        ev(
            3L,
            "Corporate",
            "Employee Wellness",
            "Mind & Body Wellness Retreat",
            "22 May 2026",
            "Pune",
            "yoga",
            190));
    ensureEvent(
        eventRepository,
        ev(
            4L,
            "Corporate",
            "Technology & Transformation",
            "Smart Technology Summit",
            "3 June 2026",
            "Bengaluru",
            "hackathon",
            250));
    ensureEvent(
        eventRepository,
        ev(
            5L,
            "Corporate",
            "Marathon / Fitness",
            "Corporate Sports Fest",
            "12 June 2026",
            "Mumbai",
            "marathon",
            170));
    ensureEvent(
        eventRepository,
        ev(
            6L,
            "Corporate",
            "Live Entertainment",
            "Annual Entertainment Night & Team Outing (Villa Experience)",
            "20 June 2026",
            "Hyderabad",
            "liveconcert",
            210));
  }

  private static void ensureEvent(EventRepository eventRepository, Event event) {
    if (eventRepository.findById(event.getId()).isEmpty()) {
      eventRepository.save(event);
    }
  }

  private static Event ev(
      Long id,
      String category,
      String subEvent,
      String title,
      String date,
      String location,
      String imageKey,
      Integer totalTickets) {
    Event e = new Event();
    e.setId(id);
    e.setCategory(category);
    e.setSubEvent(subEvent);
    e.setTitle(title);
    e.setDate(date);
    e.setLocation(location);
    e.setImageKey(imageKey);
    e.setTotalTickets(totalTickets);
    return e;
  }

  private static void ensureSeedPlans(EventPlanRepository eventPlanRepository) {
    if (!eventPlanRepository.findByEventId(1L).isEmpty()) {
      return;
    }
    eventPlanRepository.replaceForEvent(
        1L,
        List.of(
            plan(
                "3 Star - Basic Pass",
                1500,
                1,
                "Access to leadership sessions",
                "Entry to keynote speeches",
                "Basic seating arrangement",
                "Networking in common areas",
                "Event ID and welcome kit",
                "Participation certificate"),
            plan(
                "4 Star - Standard Pass",
                3500,
                2,
                "All 3 Star features included",
                "Priority seating (front/middle rows)",
                "Lunch and refreshments included",
                "Access to panel discussions",
                "Business networking session",
                "Standard corporate kit"),
            plan(
                "5 Star - Premium Pass",
                7000,
                3,
                "All 4 Star features included",
                "VIP seating access",
                "One-on-one networking with leaders",
                "Exclusive leadership workshop",
                "Premium dining experience",
                "Executive gift hamper and certificate")));
    eventPlanRepository.replaceForEvent(
        2L,
        List.of(
            plan(
                "3 Star - Basic Entry",
                1000,
                1,
                "Entry to startup event",
                "Access to pitch sessions",
                "Open networking space",
                "Event badge and brochure",
                "Basic refreshments",
                "Participation certificate"),
            plan(
                "4 Star - Standard Entry",
                2500,
                2,
                "All 3 Star features included",
                "Access to startup workshops",
                "Networking with founders and investors",
                "Lunch included",
                "Priority entry to sessions",
                "Startup kit (notebook and badge)"),
            plan(
                "5 Star - Premium Entry",
                5000,
                3,
                "All 4 Star features included",
                "VIP access to investor meet",
                "Pitch opportunity (limited slots)",
                "One-on-one mentorship session",
                "Premium seating and fast-track entry",
                "Exclusive startup kit and goodies")));
    eventPlanRepository.replaceForEvent(
        3L,
        List.of(
            plan(
                "3 Star - Basic Wellness",
                1200,
                1,
                "Group yoga and meditation session",
                "Guided relaxation exercises",
                "Healthy snacks and beverages",
                "Open seating arrangement",
                "Basic wellness consultation",
                "Participation certificate"),
            plan(
                "4 Star - Standard Wellness",
                2800,
                2,
                "All 3 Star features included",
                "Personal trainer guidance (group-based)",
                "Breakfast and lunch included",
                "Stress management workshop",
                "Priority seating and calm zone access",
                "Wellness kit (mat and bottle)"),
            plan(
                "5 Star - Premium Wellness",
                5500,
                3,
                "All 4 Star features included",
                "Private instructor sessions",
                "Spa and therapy treatments",
                "Resort access and relaxation zone",
                "Premium meals (full-day)",
                "Gift hamper and premium certificate")));
    eventPlanRepository.replaceForEvent(
        4L,
        List.of(
            plan(
                "3 Star - Basic Pass",
                800,
                1,
                "Entry to summit",
                "Access to basic sessions",
                "Expo booth access",
                "Event schedule and brochure",
                "Networking in general areas",
                "Participation certificate"),
            plan(
                "4 Star - Standard Pass",
                2000,
                2,
                "All 3 Star features included",
                "Access to technical workshops",
                "Networking with professionals",
                "Lunch and refreshments",
                "Priority session access",
                "Tech kit (notebook and badge)"),
            plan(
                "5 Star - Premium Pass",
                4000,
                3,
                "All 4 Star features included",
                "VIP keynote session access",
                "One-on-one expert interaction",
                "Exclusive product demos",
                "Fast-track entry and reserved seating",
                "Premium tech kit and goodies")));
    eventPlanRepository.replaceForEvent(
        5L,
        List.of(
            plan(
                "3 Star - Basic Entry",
                600,
                1,
                "Participation in sports events",
                "Event T-shirt",
                "Water bottle",
                "Access to basic facilities",
                "Medical support availability",
                "Participation certificate"),
            plan(
                "4 Star - Standard Entry",
                1500,
                2,
                "All 3 Star features included",
                "Access to multiple sports events",
                "Energy drinks and snacks",
                "Priority registration",
                "Event kit (cap and towel)",
                "Medal for participation"),
            plan(
                "5 Star - Premium Entry",
                3000,
                3,
                "All 4 Star features included",
                "Personal coach guidance",
                "Premium sports kit",
                "VIP rest and recovery area",
                "Health checkup session",
                "Trophy and premium certificate")));
    eventPlanRepository.replaceForEvent(
        6L,
        List.of(
            plan(
                "3 Star - Basic Package",
                2000,
                1,
                "Entry to entertainment night",
                "Shared villa access (day outing)",
                "Music and DJ access",
                "Snacks and soft drinks",
                "Group activities",
                "Basic seating arrangement"),
            plan(
                "4 Star - Standard Package",
                4500,
                2,
                "All 3 Star features included",
                "Premium villa access",
                "Lunch and dinner included",
                "Pool and indoor games access",
                "Reserved seating for events",
                "Team bonding activities"),
            plan(
                "5 Star - Premium Package",
                8000,
                3,
                "All 4 Star features included",
                "Private villa space access",
                "Unlimited food and beverages",
                "DJ night and live entertainment",
                "VIP lounge and poolside access",
                "Premium gifts and team experience")));
  }

  private static EventPlan plan(
      String tierName, Integer price, Integer sortOrder, String... features) {
    EventPlan plan = new EventPlan();
    plan.setTierName(tierName);
    plan.setPrice(price);
    plan.setSortOrder(sortOrder);
    plan.setFeatures(List.of(features));
    return plan;
  }
}
