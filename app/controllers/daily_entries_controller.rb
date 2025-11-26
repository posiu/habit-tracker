class DailyEntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_daily_entry, only: [:show, :edit, :update, :destroy]

  def index
    @daily_entries = current_user.daily_entries.order(entry_date: :desc)
  end

  def show
  end

  def new
    @daily_entry = current_user.daily_entries.build(entry_date: Date.current)
  end

  def create
    @daily_entry = current_user.daily_entries.build(daily_entry_params)
    
    if @daily_entry.save
      redirect_to @daily_entry, notice: 'Daily entry was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @daily_entry.update(daily_entry_params)
      redirect_to @daily_entry, notice: 'Daily entry was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @daily_entry.destroy
    redirect_to daily_entries_url, notice: 'Daily entry was successfully deleted.'
  end

  private

  def set_daily_entry
    @daily_entry = current_user.daily_entries.find(params[:id])
  end

  def daily_entry_params
    params.require(:daily_entry).permit(:entry_date, :mood, :notes)
  end
end
