package com.eventify.model;

public class Booking {
  private String id;
  private String guestName;
  private String guestEmail;
  private String phone;
  private Integer tickets;
  private Long eventId;
  private String eventTitle;
  private String category;
  private String eventDate;
  private String eventLocation;
  private String planTier;
  private Integer planPrice;
  private String accountEmail;
  private String bookedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getGuestName() {
    return guestName;
  }

  public void setGuestName(String guestName) {
    this.guestName = guestName;
  }

  public String getGuestEmail() {
    return guestEmail;
  }

  public void setGuestEmail(String guestEmail) {
    this.guestEmail = guestEmail;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public Integer getTickets() {
    return tickets;
  }

  public void setTickets(Integer tickets) {
    this.tickets = tickets;
  }

  public Long getEventId() {
    return eventId;
  }

  public void setEventId(Long eventId) {
    this.eventId = eventId;
  }

  public String getEventTitle() {
    return eventTitle;
  }

  public void setEventTitle(String eventTitle) {
    this.eventTitle = eventTitle;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getEventDate() {
    return eventDate;
  }

  public void setEventDate(String eventDate) {
    this.eventDate = eventDate;
  }

  public String getEventLocation() {
    return eventLocation;
  }

  public void setEventLocation(String eventLocation) {
    this.eventLocation = eventLocation;
  }

  public String getAccountEmail() {
    return accountEmail;
  }

  public String getPlanTier() {
    return planTier;
  }

  public void setPlanTier(String planTier) {
    this.planTier = planTier;
  }

  public Integer getPlanPrice() {
    return planPrice;
  }

  public void setPlanPrice(Integer planPrice) {
    this.planPrice = planPrice;
  }

  public void setAccountEmail(String accountEmail) {
    this.accountEmail = accountEmail;
  }

  public String getBookedAt() {
    return bookedAt;
  }

  public void setBookedAt(String bookedAt) {
    this.bookedAt = bookedAt;
  }
}
